using QueueUp.Api.Domain;

namespace QueueUp.Api.Contracts;

public record QueueOverviewResponse(
    Guid Id,
    string Name,
    char Prefix,
    int AverageServiceMinutes,
    QueueStatus Status,
    int PeopleWaiting,
    int IssuedToday,
    int ServedToday,
    int NoShowsToday)
{
    public static QueueOverviewResponse From(Queue queue, DateTimeOffset now)
    {
        return new QueueOverviewResponse(
            queue.Id,
            queue.Name,
            queue.Prefix,
            queue.AverageServiceMinutes,
            queue.Status,
            queue.CountWaiting(now),
            queue.CountIssuedToday(now),
            queue.TokensToday(TokenStatus.Served, now).Count,
            queue.TokensToday(TokenStatus.NoShow, now).Count);
    }
}
