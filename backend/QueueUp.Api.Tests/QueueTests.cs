using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class QueueTests
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
    public void NewQueue_StartsClosed()
    {
        var queue = new Queue { Name = "General OPD", Prefix = 'A' };

        Assert.Equal(QueueStatus.Closed, queue.Status);
    }

    [Fact]
    public void Join_FirstCustomer_GetsTokenA001()
    {
        var queue = CreateOpenQueue();

        var token = queue.Join("Anu", Morning);

        Assert.Equal(1, token.Number);
        Assert.Equal("A-001", token.DisplayNumber);
        Assert.Equal("Anu", token.CustomerName);
        Assert.Equal(TokenStatus.Waiting, token.Status);
    }

    [Fact]
    public void Join_ThreeCustomers_GetNumbersInOrder()
    {
        var queue = CreateOpenQueue();

        var first = queue.Join("Anu", Morning);
        var second = queue.Join(null, Morning);
        var third = queue.Join("Rahul", Morning);

        Assert.Equal(1, first.Number);
        Assert.Equal(2, second.Number);
        Assert.Equal(3, third.Number);
    }

    [Fact]
    public void Join_ClosedQueue_Throws()
    {
        var queue = new Queue { Name = "General OPD", Prefix = 'A' };

        var exception = Assert.Throws<InvalidOperationException>(() => queue.Join("Anu", Morning));

        Assert.Equal("Queue General OPD is not accepting new tokens because it is Closed.", exception.Message);
    }

    [Fact]
    public void Join_PausedQueue_Throws()
    {
        var queue = CreateOpenQueue();
        queue.Pause();

        var exception = Assert.Throws<InvalidOperationException>(() => queue.Join("Anu", Morning));

        Assert.Equal("Queue General OPD is not accepting new tokens because it is Paused.", exception.Message);
    }

    [Fact]
    public void CountPeopleAhead_ThirdCustomer_HasTwoAhead()
    {
        var queue = CreateOpenQueue();
        queue.Join("Anu", Morning);
        queue.Join("Rahul", Morning);
        var third = queue.Join("Meera", Morning);

        int ahead = queue.CountPeopleAhead(third);

        Assert.Equal(2, ahead);
    }

    [Fact]
    public void CountPeopleAhead_FirstCustomer_HasNobodyAhead()
    {
        var queue = CreateOpenQueue();
        var first = queue.Join("Anu", Morning);
        queue.Join("Rahul", Morning);

        int ahead = queue.CountPeopleAhead(first);

        Assert.Equal(0, ahead);
    }

    [Fact]
    public void CountPeopleAhead_IgnoresTokensThatAreNoLongerWaiting()
    {
        var queue = CreateOpenQueue();
        var first = queue.Join("Anu", Morning);
        var second = queue.Join("Rahul", Morning);
        var third = queue.Join("Meera", Morning);
        first.Call("Counter 1");
        second.Cancel();

        int ahead = queue.CountPeopleAhead(third);

        Assert.Equal(0, ahead);
    }

    // CallNext: staff call the next waiting customer to their counter

    [Fact]
    public void CallNext_CallsOldestWaitingToken()
    {
        var queue = CreateOpenQueue();
        var first = queue.Join("Anu", Morning);
        queue.Join("Rahul", Morning);

        var called = queue.CallNext("Counter 1");

        Assert.Same(first, called);
        Assert.Equal(TokenStatus.Called, first.Status);
        Assert.Equal("Counter 1", first.CounterName);
    }

    [Fact]
    public void CallNext_PassesOverTokensThatAreNotWaiting()
    {
        var queue = CreateOpenQueue();
        var first = queue.Join("Anu", Morning);
        var second = queue.Join("Rahul", Morning);
        first.Cancel();

        var called = queue.CallNext("Counter 1");

        Assert.Same(second, called);
    }

    [Fact]
    public void CallNext_NobodyWaiting_ReturnsNull()
    {
        var queue = CreateOpenQueue();

        var called = queue.CallNext("Counter 1");

        Assert.Null(called);
    }

    [Fact]
    public void CallNext_CounterStillServing_Throws()
    {
        var queue = CreateOpenQueue();
        queue.Join("Anu", Morning);
        queue.Join("Rahul", Morning);
        queue.CallNext("Counter 1");

        var exception = Assert.Throws<InvalidOperationException>(() => queue.CallNext("Counter 1"));

        Assert.Equal("Counter 1 is still serving A-001. Mark it served or skipped first.", exception.Message);
    }

    [Fact]
    public void CallNext_AfterServing_CallsTheNextToken()
    {
        var queue = CreateOpenQueue();
        var first = queue.Join("Anu", Morning);
        var second = queue.Join("Rahul", Morning);
        queue.CallNext("Counter 1");
        first.Serve();

        var called = queue.CallNext("Counter 1");

        Assert.Same(second, called);
    }

    [Fact]
    public void CallNext_TwoCounters_GetDifferentTokens()
    {
        var queue = CreateOpenQueue();
        var first = queue.Join("Anu", Morning);
        var second = queue.Join("Rahul", Morning);

        var calledByCounter1 = queue.CallNext("Counter 1");
        var calledByCounter2 = queue.CallNext("Counter 2");

        Assert.Same(first, calledByCounter1);
        Assert.Same(second, calledByCounter2);
    }

    // FindToken: look up a token by its secret Id

    [Fact]
    public void Join_TokenRemembersItsQueue()
    {
        var queue = CreateOpenQueue();

        var token = queue.Join("Anu", Morning);

        Assert.Equal(queue.Id, token.QueueId);
    }

    [Fact]
    public void FindToken_ExistingId_ReturnsThatToken()
    {
        var queue = CreateOpenQueue();
        queue.Join("Anu", Morning);
        var second = queue.Join("Rahul", Morning);

        var found = queue.FindToken(second.Id);

        Assert.Same(second, found);
    }

    [Fact]
    public void FindToken_UnknownId_ReturnsNull()
    {
        var queue = CreateOpenQueue();
        queue.Join("Anu", Morning);

        var found = queue.FindToken(Guid.NewGuid());

        Assert.Null(found);
    }

    // Service day: numbers restart every morning (India time)

    [Fact]
    public void Join_RecordsTheTimeAndServiceDay()
    {
        var queue = CreateOpenQueue();

        var token = queue.Join("Anu", Morning);

        Assert.Equal(Morning, token.CreatedAt);
        Assert.Equal(new DateOnly(2026, 10, 15), token.ServiceDate);
    }

    [Fact]
    public void Join_NextDay_NumberingRestartsAtOne()
    {
        var queue = CreateOpenQueue();
        queue.Join("Anu", Morning);
        queue.Join("Rahul", Morning);

        var tomorrow = queue.Join("Meera", Morning.AddDays(1));

        Assert.Equal(1, tomorrow.Number);
        Assert.Equal("A-001", tomorrow.DisplayNumber);
    }

    [Fact]
    public void CountPeopleAhead_IgnoresTokensFromOtherDays()
    {
        var queue = CreateOpenQueue();
        queue.Join("Old", Morning.AddDays(-1));
        queue.Join("Anu", Morning);
        var rahul = queue.Join("Rahul", Morning);

        int ahead = queue.CountPeopleAhead(rahul);

        Assert.Equal(1, ahead);
    }
}
