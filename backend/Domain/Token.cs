namespace QueueUp.Api.Domain;

public class Token
{
    public Guid Id { get; set; }
    public char Prefix { get; set; }
    public int Number { get; set; }
    public TokenStatus Status { get; set; }
    public string? CustomerName { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public string DisplayNumber => $"{Prefix}-{Number:D3}";
}
