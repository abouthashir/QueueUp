using QueueUp.Api.Domain;

namespace QueueUp.Api.Contracts;

public record DashboardResponse(
    QueueResponse Queue,
    string CounterName,
    TokenResponse? NowServing,
    IReadOnlyList<TokenSummary> Waiting,
    IReadOnlyList<TokenSummary> Skipped,
    int ServedToday)
{
    public static DashboardResponse From(Queue queue, string counterName, DateTimeOffset now)
    {
        Token? current = queue.CurrentTokenAt(counterName);

        return new DashboardResponse(
            QueueResponse.From(queue, now),
            counterName,
            current == null ? null : TokenResponse.From(queue, current),
            queue.TokensToday(TokenStatus.Waiting, now).Select(TokenSummary.From).ToList(),
            queue.TokensToday(TokenStatus.Skipped, now).Select(TokenSummary.From).ToList(),
            queue.TokensToday(TokenStatus.Served, now).Count);
    }
}
