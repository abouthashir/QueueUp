namespace QueueUp.Api.Domain;

public class Token
{
    public Guid Id { get; init; }
    public Guid QueueId { get; init; }
    public char Prefix { get; init; }
    public int Number { get; init; }
    public TokenStatus Status { get; private set; }
    public string? CustomerName { get; init; }
    public string? CounterName { get; private set; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateOnly ServiceDate { get; init; }

    public string DisplayNumber => $"{Prefix}-{Number:D3}";

    public void Call(string counterName)
    {
        EnsureStatus(TokenStatus.Waiting, "called");
        Status = TokenStatus.Called;
        CounterName = counterName;
    }

    public void Serve()
    {
        EnsureStatus(TokenStatus.Called, "served");
        Status = TokenStatus.Served;
    }

    public void Skip()
    {
        EnsureStatus(TokenStatus.Called, "skipped");
        Status = TokenStatus.Skipped;
    }

    public void Recall(string counterName)
    {
        EnsureStatus(TokenStatus.Skipped, "recalled");
        Status = TokenStatus.Called;
        CounterName = counterName;
    }

    public void Cancel()
    {
        EnsureStatus(TokenStatus.Waiting, "cancelled");
        Status = TokenStatus.Cancelled;
    }

    private void EnsureStatus(TokenStatus requiredStatus, string action)
    {
        if (Status != requiredStatus)
        {
            throw new InvalidOperationException(
                $"Token {DisplayNumber} cannot be {action} because it is {Status}.");
        }
    }
}
