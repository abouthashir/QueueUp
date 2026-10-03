using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class QueueTests
{
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
    public void NewQueue_StartsClosed()
    {
        var queue = new Queue { Name = "General OPD", Prefix = 'A' };

        Assert.Equal(QueueStatus.Closed, queue.Status);
    }
}
