namespace QueueUp.Api.Domain;

public class Queue
{
    private readonly List<Token> _tokens = new();

    public Guid Id { get; init; }
    public required string Name { get; init; }
    public char Prefix { get; init; }
    public int AverageServiceMinutes { get; init; }
    public QueueStatus Status { get; private set; }

    public void Open()
    {
        Status = QueueStatus.Open;
    }

    public void Pause()
    {
        Status = QueueStatus.Paused;
    }

    public Token Join(string? customerName, DateTimeOffset now)
    {
        if (Status != QueueStatus.Open)
        {
            throw new InvalidOperationException($"Queue {Name} is not accepting new tokens because it is {Status}.");
        }

        DateOnly today = ServiceDay.For(now);

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

    public int CountPeopleAhead(Token token)
    {
        return _tokens.Count(other =>
            other.ServiceDate == token.ServiceDate
            && other.Status == TokenStatus.Waiting
            && other.Number < token.Number);
    }

    public Token? CallNext(string counterName)
    {
        Token? current = _tokens.FirstOrDefault(token =>
            token.Status == TokenStatus.Called && token.CounterName == counterName);

        if (current != null)
        {
            throw new InvalidOperationException(
                $"{counterName} is still serving {current.DisplayNumber}. Mark it served or skipped first.");
        }

        Token? next = _tokens
            .Where(token => token.Status == TokenStatus.Waiting)
            .OrderBy(token => token.Number)
            .FirstOrDefault();

        if (next == null)
        {
            return null;
        }

        next.Call(counterName);
        return next;
    }

    public Token? FindToken(Guid tokenId)
    {
        return _tokens.FirstOrDefault(token => token.Id == tokenId);
    }
}
