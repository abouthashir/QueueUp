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

    // Concurrency: two counters calling at the same moment

    [Fact]
    public async Task TwoCountersCallingAtOnce_OnlyTheFirstSaveWins()
    {
        string databaseName = Guid.NewGuid().ToString();
        var setupStore = new QueueStore(CreateDatabase(databaseName));
        var setupQueue = await setupStore.FindQueueAsync(QueueStore.DemoQueueId);
        Assert.NotNull(setupQueue);
        setupQueue.Join("Anu", Morning);
        setupQueue.Join("Rahul", Morning);
        await setupStore.SaveChangesAsync();

        var counter1 = new QueueStore(CreateDatabase(databaseName));
        var counter2 = new QueueStore(CreateDatabase(databaseName));
        var queueSeenByCounter1 = await counter1.FindQueueAsync(QueueStore.DemoQueueId);
        var queueSeenByCounter2 = await counter2.FindQueueAsync(QueueStore.DemoQueueId);
        Assert.NotNull(queueSeenByCounter1);
        Assert.NotNull(queueSeenByCounter2);

        var calledByCounter1 = queueSeenByCounter1.CallNext("Counter 1", Morning);
        var calledByCounter2 = queueSeenByCounter2.CallNext("Counter 2", Morning);
        Assert.NotNull(calledByCounter1);
        Assert.NotNull(calledByCounter2);
        Assert.Equal(calledByCounter1.Id, calledByCounter2.Id);

        bool counter1Saved = await counter1.TrySaveChangesAsync();
        bool counter2Saved = await counter2.TrySaveChangesAsync();

        Assert.True(counter1Saved);
        Assert.False(counter2Saved);
    }

    [Fact]
    public async Task AfterLosingTheRace_RetryingCallsTheNextPerson()
    {
        string databaseName = Guid.NewGuid().ToString();
        var setupStore = new QueueStore(CreateDatabase(databaseName));
        var setupQueue = await setupStore.FindQueueAsync(QueueStore.DemoQueueId);
        Assert.NotNull(setupQueue);
        setupQueue.Join("Anu", Morning);
        setupQueue.Join("Rahul", Morning);
        await setupStore.SaveChangesAsync();

        var counter1 = new QueueStore(CreateDatabase(databaseName));
        var counter2 = new QueueStore(CreateDatabase(databaseName));
        var queue1 = await counter1.FindQueueAsync(QueueStore.DemoQueueId);
        var queue2 = await counter2.FindQueueAsync(QueueStore.DemoQueueId);
        Assert.NotNull(queue1);
        Assert.NotNull(queue2);
        queue1.CallNext("Counter 1", Morning);
        queue2.CallNext("Counter 2", Morning);
        await counter1.TrySaveChangesAsync();
        Assert.False(await counter2.TrySaveChangesAsync());

        var retryQueue = await counter2.FindQueueAsync(QueueStore.DemoQueueId);
        Assert.NotNull(retryQueue);
        var called = retryQueue.CallNext("Counter 2", Morning);

        Assert.NotNull(called);
        Assert.Equal("Rahul", called.CustomerName);
        Assert.True(await counter2.TrySaveChangesAsync());
    }
}
