using QueueUp.Api.Domain;

namespace QueueUp.Api.Contracts;

public record TokenResponse(
    Guid Id,
    Guid QueueId,
    string DisplayNumber,
    TokenStatus Status,
    string QueueName,
    QueueStatus QueueStatus,
    string? CustomerName,
    string? CounterName,
    int PeopleAhead,
    int EstimatedWaitMinutes,
    IReadOnlyList<string> NowServing)
{
    public static TokenResponse From(Queue queue, Token token)
    {
        int peopleAhead = 0;
        int estimatedWaitMinutes = 0;

        if (token.Status == TokenStatus.Waiting)
        {
            peopleAhead = queue.CountPeopleAhead(token);

            // Active counters will come from staff sign-ins; until then we assume one.
            estimatedWaitMinutes = WaitTimeEstimator.EstimateMinutes(
                peopleAhead, queue.AverageServiceMinutes, activeCounters: 1);
        }

        return new TokenResponse(
            token.Id,
            queue.Id,
            token.DisplayNumber,
            token.Status,
            queue.Name,
            queue.Status,
            token.CustomerName,
            token.CounterName,
            peopleAhead,
            estimatedWaitMinutes,
            queue.TokensOn(token.ServiceDate, TokenStatus.Called).Select(called => called.DisplayNumber).ToList());
    }
}
