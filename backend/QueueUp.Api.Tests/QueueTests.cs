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

    [Fact]
    public void Join_FirstCustomer_GetsTokenA001()
    {
        var queue = CreateOpenQueue();

        var token = queue.Join("Anu");

        Assert.Equal(1, token.Number);
        Assert.Equal("A-001", token.DisplayNumber);
        Assert.Equal("Anu", token.CustomerName);
        Assert.Equal(TokenStatus.Waiting, token.Status);
    }

    [Fact]
    public void Join_ThreeCustomers_GetNumbersInOrder()
    {
        var queue = CreateOpenQueue();

        var first = queue.Join("Anu");
        var second = queue.Join(null);
        var third = queue.Join("Rahul");

        Assert.Equal(1, first.Number);
        Assert.Equal(2, second.Number);
        Assert.Equal(3, third.Number);
    }

    [Fact]
    public void Join_ClosedQueue_Throws()
    {
        var queue = new Queue { Name = "General OPD", Prefix = 'A' };

        var exception = Assert.Throws<InvalidOperationException>(() => queue.Join("Anu"));

        Assert.Equal("Queue General OPD is not accepting new tokens because it is Closed.", exception.Message);
    }

    [Fact]
    public void Join_PausedQueue_Throws()
    {
        var queue = CreateOpenQueue();
        queue.Pause();

        var exception = Assert.Throws<InvalidOperationException>(() => queue.Join("Anu"));

        Assert.Equal("Queue General OPD is not accepting new tokens because it is Paused.", exception.Message);
    }

    [Fact]
    public void CountPeopleAhead_ThirdCustomer_HasTwoAhead()
    {
        var queue = CreateOpenQueue();
        queue.Join("Anu");
        queue.Join("Rahul");
        var third = queue.Join("Meera");

        int ahead = queue.CountPeopleAhead(third);

        Assert.Equal(2, ahead);
    }

    [Fact]
    public void CountPeopleAhead_FirstCustomer_HasNobodyAhead()
    {
        var queue = CreateOpenQueue();
        var first = queue.Join("Anu");
        queue.Join("Rahul");

        int ahead = queue.CountPeopleAhead(first);

        Assert.Equal(0, ahead);
    }

    [Fact]
    public void CountPeopleAhead_IgnoresTokensThatAreNoLongerWaiting()
    {
        var queue = CreateOpenQueue();
        var first = queue.Join("Anu");
        var second = queue.Join("Rahul");
        var third = queue.Join("Meera");
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
        var first = queue.Join("Anu");
        queue.Join("Rahul");

        var called = queue.CallNext("Counter 1");

        Assert.Same(first, called);
        Assert.Equal(TokenStatus.Called, first.Status);
        Assert.Equal("Counter 1", first.CounterName);
    }

    [Fact]
    public void CallNext_PassesOverTokensThatAreNotWaiting()
    {
        var queue = CreateOpenQueue();
        var first = queue.Join("Anu");
        var second = queue.Join("Rahul");
        first.Cancel();

        var called = queue.CallNext("Counter 1");

        Assert.Same(second, called);
    }
}
