using QueueUp.Api.Data;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class QueueStoreTests
{
    [Fact]
    public void NewStore_HasOpenDemoQueue()
    {
        var store = new QueueStore();

        var queue = store.FindQueue(QueueStore.DemoQueueId);

        Assert.NotNull(queue);
        Assert.Equal("General OPD", queue.Name);
        Assert.Equal(QueueStatus.Open, queue.Status);
    }

    [Fact]
    public void FindQueue_UnknownId_ReturnsNull()
    {
        var store = new QueueStore();

        var queue = store.FindQueue(Guid.NewGuid());

        Assert.Null(queue);
    }

    [Fact]
    public void FindToken_TokenInDemoQueue_ReturnsIt()
    {
        var store = new QueueStore();
        var queue = store.FindQueue(QueueStore.DemoQueueId);
        Assert.NotNull(queue);
        var token = queue.Join("Anu");

        var found = store.FindToken(token.Id);

        Assert.Same(token, found);
    }
}
