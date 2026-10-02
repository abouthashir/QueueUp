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

    public void Serve()
    {
        if (Status != TokenStatus.Called)
        {
            throw new InvalidOperationException($"Token {DisplayNumber} cannot be served because it is {Status}.");
        }

        Status = TokenStatus.Served;
    }

    public void Skip()
    {
        if (Status != TokenStatus.Called)
        {
            throw new InvalidOperationException($"Token {DisplayNumber} cannot be skipped because it is {Status}.");
        }

        Status = TokenStatus.Skipped;
    }

    public void Recall(string counterName)
    {
        if (Status != TokenStatus.Skipped)
        {
            throw new InvalidOperationException($"Token {DisplayNumber} cannot be recalled because it is {Status}.");
        }

        Status = TokenStatus.Called;
        CounterName = counterName;
    }

    public void Cancel()
    {
        if (Status != TokenStatus.Waiting)
        {
            throw new InvalidOperationException($"Token {DisplayNumber} cannot be cancelled because it is {Status}.");
        }

        Status = TokenStatus.Cancelled;
    }
}
