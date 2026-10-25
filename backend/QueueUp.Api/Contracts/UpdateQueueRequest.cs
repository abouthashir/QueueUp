namespace QueueUp.Api.Contracts;

public record UpdateQueueRequest(string Name, int AverageServiceMinutes, int? DailyTokenLimit = null)
{
    public string? FindProblem()
    {
        return new CreateQueueRequest(Name, 'A', AverageServiceMinutes, DailyTokenLimit).FindProblem();
    }
}
