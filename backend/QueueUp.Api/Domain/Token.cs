namespace QueueUp.Api.Domain;

public class Token
{
    public Guid Id { get; init; }
    public char Prefix { get; init; }
    public int Number { get; init; }
    public TokenStatus Status { get; private set; }
    public string? CustomerName { get; init; }
    public string? CounterName { get; private set; }
    public DateTimeOffset CreatedAt { get; init; }

    public string DisplayNumber => $"{Prefix}-{Number:D3}";

        public void Call(string counterName)
    {
        if (Status != TokenStatus.Waiting)
        {
            throw new InvalidOperationException($"Token {DisplayNumber} cannot be called because it is {Status}.");
        }

        Status = TokenStatus.Called;
        CounterName = counterName;
    }
}
