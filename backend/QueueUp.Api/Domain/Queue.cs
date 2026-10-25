namespace QueueUp.Api.Domain;

public class Queue
{
    private readonly List<Token> _tokens = new();

    public Guid Id { get; init; }
    public Guid BusinessId { get; init; }
    public required string Name { get; set; }
    public char Prefix { get; init; }
    public int AverageServiceMinutes { get; set; }
    public int? DailyTokenLimit { get; set; }
    public QueueStatus Status { get; private set; }

    public void Open()
    {
        Status = QueueStatus.Open;
    }

    public void Pause()
    {
        Status = QueueStatus.Paused;
    }

    public void Close()
    {
        Token? current = _tokens.FirstOrDefault(token => token.Status == TokenStatus.Called);

        if (current != null)
        {
            throw new InvalidOperationException(
                $"{current.CounterName} is still serving {current.DisplayNumber}. Mark it served or skipped before closing.");
        }

        foreach (Token token in _tokens)
        {
            if (token.Status == TokenStatus.Waiting)
            {
                token.Cancel();
            }
            else if (token.Status == TokenStatus.Skipped)
            {
                token.MarkNoShow();
            }
        }

        Status = QueueStatus.Closed;
    }

    public Token Join(string? customerName, DateTimeOffset now)
    {
        if (Status != QueueStatus.Open)
        {
            throw new InvalidOperationException($"Queue {Name} is not accepting new tokens because it is {Status}.");
        }

        DateOnly today = ServiceDay.For(now);


        if (DailyTokenLimit != null && CountIssuedToday(now) >= DailyTokenLimit)
        {
            throw new InvalidOperationException(
                $"Queue {Name} has given out all {DailyTokenLimit} tokens for today. Please come back tomorrow.");
        }

        var token = new Token
        {
            Id = Guid.NewGuid(),
            QueueId = Id,
            Prefix = Prefix,
            Number = _tokens.Count(other => other.ServiceDate == today) + 1,
            CustomerName = customerName,
            CreatedAt = now,
            ServiceDate = today
        };

        _tokens.Add(token);
        return token;
    }

    public int CountWaiting(DateTimeOffset now)
    {
        return TokensToday(TokenStatus.Waiting, now).Count;
    }

    public int CountIssuedToday(DateTimeOffset now)
    {
        DateOnly today = ServiceDay.For(now);
        return _tokens.Count(token => token.ServiceDate == today);
    }

    public IReadOnlyList<Token> TokensToday(TokenStatus status, DateTimeOffset now)
    {
        return TokensOn(ServiceDay.For(now), status);
    }

    public IReadOnlyList<Token> TokensOn(DateOnly day, TokenStatus status)
    {
        return _tokens
            .Where(token => token.ServiceDate == day && token.Status == status)
            .OrderBy(token => token.Number)
            .ToList();
    }

    public Token? CurrentTokenAt(string counterName)
    {
        return _tokens.FirstOrDefault(token =>
            token.Status == TokenStatus.Called && token.CounterName == counterName);
    }

    public int CountPeopleAhead(Token token)
    {
        return _tokens.Count(other =>
            other.ServiceDate == token.ServiceDate
            && other.Status == TokenStatus.Waiting
            && other.Number < token.Number);
    }

    public Token? CallNext(string counterName, DateTimeOffset now)
    {
        EnsureCounterIsFree(counterName);

        Token? next = TokensToday(TokenStatus.Waiting, now).FirstOrDefault();

        if (next == null)
        {
            return null;
        }

        next.Call(counterName);
        return next;
    }

    public void Recall(Token token, string counterName)
    {
        EnsureCounterIsFree(counterName);
        token.Recall(counterName);
    }

    public Token? FindToken(Guid tokenId)
    {
        return _tokens.FirstOrDefault(token => token.Id == tokenId);
    }

    private void EnsureCounterIsFree(string counterName)
    {
        Token? current = CurrentTokenAt(counterName);

        if (current != null)
        {
            throw new InvalidOperationException(
                $"{counterName} is still serving {current.DisplayNumber}. Mark it served or skipped first.");
        }
    }
}
