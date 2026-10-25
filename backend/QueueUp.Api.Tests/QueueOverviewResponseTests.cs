using QueueUp.Api.Contracts;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class QueueOverviewResponseTests
{
    private static readonly DateTimeOffset Morning = new(2026, 10, 15, 9, 0, 0, TimeSpan.FromHours(5.5));

    [Fact]
    public void From_CountsTodaysIssuedServedAndNoShowTokens()
    {
        var queue = new Queue { Id = Guid.NewGuid(), Name = "General OPD", Prefix = 'A', AverageServiceMinutes = 5 };
        queue.Open();
        queue.Join("Yesterday", Morning.AddDays(-1));
        var anu = queue.Join("Anu", Morning);
        var rahul = queue.Join("Rahul", Morning);
        queue.Join("Meera", Morning);
        queue.CallNext("Counter 1", Morning);
        anu.Serve();
        queue.CallNext("Counter 1", Morning);
        rahul.Skip();
        queue.Close();

        var overview = QueueOverviewResponse.From(queue, Morning);

        Assert.Equal(3, overview.IssuedToday);
        Assert.Equal(1, overview.ServedToday);
        Assert.Equal(1, overview.NoShowsToday);
        Assert.Equal(0, overview.PeopleWaiting);
        Assert.Equal('A', overview.Prefix);
    }
}
