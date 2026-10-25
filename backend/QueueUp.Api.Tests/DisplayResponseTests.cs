using QueueUp.Api.Contracts;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class DisplayResponseTests
{
    private static readonly DateTimeOffset Morning = new(2026, 10, 15, 9, 0, 0, TimeSpan.FromHours(5.5));

    [Fact]
    public void From_ShowsEachCounterAndTheNextThree()
    {
        var clinic = new Business { Id = Guid.NewGuid(), Name = "Sunrise Clinic" };
        var queue = new Queue { Id = Guid.NewGuid(), BusinessId = clinic.Id, Name = "General OPD", Prefix = 'A', AverageServiceMinutes = 5 };
        queue.Open();
        for (int i = 0; i < 6; i++)
        {
            queue.Join(null, Morning);
        }
        queue.CallNext("Counter 2", Morning);
        queue.CallNext("Counter 1", Morning);

        var display = DisplayResponse.From(clinic, queue, Morning);

        Assert.Equal("Sunrise Clinic", display.BusinessName);
        Assert.Equal(
            new[] { new CounterServing("Counter 1", "A-002"), new CounterServing("Counter 2", "A-001") },
            display.NowServing);
        Assert.Equal(new[] { "A-003", "A-004", "A-005" }, display.Next);
        Assert.Equal(4, display.PeopleWaiting);
    }
}
