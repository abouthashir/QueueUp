namespace QueueUp.Api.Domain;

public class Queue
{
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
}
