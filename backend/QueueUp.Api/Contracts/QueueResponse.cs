using QueueUp.Api.Domain;

namespace QueueUp.Api.Contracts;

public record QueueResponse(
    Guid Id,
    string Name,
    QueueStatus Status,
    int PeopleWaiting,
    int EstimatedWaitMinutes)
{
    public static QueueResponse From(Queue queue, DateTimeOffset now)
    {
        int peopleWaiting = queue.CountWaiting(now);

        // Active counters will come from staff sign-ins; until then we assume one.
        int estimatedWaitMinutes = WaitTimeEstimator.EstimateMinutes(
            peopleWaiting, queue.AverageServiceMinutes, activeCounters: 1);

        return new QueueResponse(queue.Id, queue.Name, queue.Status, peopleWaiting, estimatedWaitMinutes);
    }
}
