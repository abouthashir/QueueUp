namespace QueueUp.Api.Contracts;

public record UpdateQueueRequest(string Name, int AverageServiceMinutes)
{
    public string? FindProblem()
    {
        return new CreateQueueRequest(Name, 'A', AverageServiceMinutes).FindProblem();
    }
}
