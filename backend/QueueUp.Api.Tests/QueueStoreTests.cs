using Microsoft.EntityFrameworkCore;
using QueueUp.Api.Data;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class QueueStoreTests
{
    private static readonly DateTimeOffset Morning = new(2026, 10, 15, 9, 0, 0, TimeSpan.FromHours(5.5));
    private static QueueUpDbContext CreateDatabase(string databaseName)
    {
        var options = new DbContextOptionsBuilder<QueueUpDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        var db = new QueueUpDbContext(options);
        db.Database.EnsureCreated();
        return db;
    }

    [Fact]
    public async Task NewDatabase_HasOpenDemoQueue()
    {
        var store = new QueueStore(CreateDatabase(Guid.NewGuid().ToString()));

        var queue = await store.FindQueueAsync(QueueStore.DemoQueueId);

        Assert.NotNull(queue);
        Assert.Equal("General OPD", queue.Name);
        Assert.Equal(QueueStatus.Open, queue.Status);
    }

    [Fact]
    public async Task FindQueueAsync_UnknownId_ReturnsNull()
    {
        var store = new QueueStore(CreateDatabase(Guid.NewGuid().ToString()));

        var queue = await store.FindQueueAsync(Guid.NewGuid());

        Assert.Null(queue);
    }

    [Fact]
    public async Task SavedToken_CanBeFoundFromANewConnection()
    {
        string databaseName = Guid.NewGuid().ToString();
        var firstStore = new QueueStore(CreateDatabase(databaseName));
        var queue = await firstStore.FindQueueAsync(QueueStore.DemoQueueId);
        Assert.NotNull(queue);
        var token = queue.Join("Anu", Morning);
        await firstStore.SaveChangesAsync();

        var secondStore = new QueueStore(CreateDatabase(databaseName));
        var found = await secondStore.FindTokenAsync(token.Id);

        Assert.NotNull(found);
        Assert.Equal("A-001", found.DisplayNumber);
        Assert.Equal("Anu", found.CustomerName);
    }

    [Fact]
    public async Task FindQueueAsync_LoadsSavedTokens_SoNumberingContinues()
    {
        string databaseName = Guid.NewGuid().ToString();
        var firstStore = new QueueStore(CreateDatabase(databaseName));
        var queue = await firstStore.FindQueueAsync(QueueStore.DemoQueueId);
        Assert.NotNull(queue);
        queue.Join("Anu", Morning);
        await firstStore.SaveChangesAsync();

        var secondStore = new QueueStore(CreateDatabase(databaseName));
        var reloaded = await secondStore.FindQueueAsync(QueueStore.DemoQueueId);
        Assert.NotNull(reloaded);
        var next = reloaded.Join("Rahul", Morning);

        Assert.Equal(2, next.Number);
    }
}
