using QueueUp.Api.Contracts;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class DashboardResponseTests
{
    private static readonly DateTimeOffset Morning = new(2026, 10, 15, 9, 0, 0, TimeSpan.FromHours(5.5));

    private static Queue CreateOpenQueue()
    {
        var queue = new Queue
        {
            Id = Guid.NewGuid(),
            Name = "General OPD",
            Prefix = 'A',
            AverageServiceMinutes = 5
        };
        queue.Open();
        return queue;
    }

    [Fact]
    public void From_ShowsNowServingWaitingSkippedAndServedCounts()
    {
        var queue = CreateOpenQueue();
        var anu = queue.Join("Anu", Morning);
        var rahul = queue.Join("Rahul", Morning);
        queue.Join("Meera", Morning);
        queue.Join("Joseph", Morning);
        queue.CallNext("Counter 1", Morning);
        anu.Serve();
        queue.CallNext("Counter 1", Morning);
        rahul.Skip();
        queue.CallNext("Counter 1", Morning);

        var dashboard = DashboardResponse.From(queue, "Counter 1", Morning);

        Assert.Equal("Counter 1", dashboard.CounterName);
        Assert.NotNull(dashboard.NowServing);
        Assert.Equal("A-003", dashboard.NowServing.DisplayNumber);
        Assert.Equal(new[] { "A-004" }, dashboard.Waiting.Select(token => token.DisplayNumber));
        Assert.Equal(new[] { "A-002" }, dashboard.Skipped.Select(token => token.DisplayNumber));
        Assert.Equal(1, dashboard.ServedToday);
    }

    [Fact]
    public void From_CounterServingNobody_HasNoNowServing()
    {
        var queue = CreateOpenQueue();
        queue.Join("Anu", Morning);

        var dashboard = DashboardResponse.From(queue, "Counter 2", Morning);

        Assert.Null(dashboard.NowServing);
        Assert.Single(dashboard.Waiting);
    }
}
