namespace QueueUp.Api.Domain;

public class Token
{
    public Guid Id { get; init; }
    public char Prefix { get; init; }
    public int Number { get; init; }
    public TokenStatus Status { get; private set; }
    public string? CustomerName { get; init; }
    public DateTimeOffset CreatedAt { get; init; }

    public string DisplayNumber => $"{Prefix}-{Number:D3}";
}
