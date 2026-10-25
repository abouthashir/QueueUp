using QueueUp.Api.Domain;

namespace QueueUp.Api.Contracts;

public record CounterServing(string CounterName, string DisplayNumber);

public record DisplayResponse(
    string BusinessName,
    string QueueName,
    QueueStatus Status,
    IReadOnlyList<CounterServing> NowServing,
    IReadOnlyList<string> Next,
    int PeopleWaiting)
{
    public const int NextCount = 3;

    public static DisplayResponse From(Business business, Queue queue, DateTimeOffset now)
    {
        IReadOnlyList<Token> waiting = queue.TokensToday(TokenStatus.Waiting, now);

        return new DisplayResponse(
            business.Name,
            queue.Name,
            queue.Status,
            queue.TokensToday(TokenStatus.Called, now)
                .OrderBy(token => token.CounterName)
                .Select(token => new CounterServing(token.CounterName ?? "", token.DisplayNumber))
                .ToList(),
            waiting.Take(NextCount).Select(token => token.DisplayNumber).ToList(),
            waiting.Count);
    }
}
