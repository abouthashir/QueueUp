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

    public Token Join(string? customerName)
    {
        var token = new Token
        {
            Id = Guid.NewGuid(),
            Prefix = Prefix,
            Number = _tokens.Count + 1,
            CustomerName = customerName,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _tokens.Add(token);
        return token;
    }
}
