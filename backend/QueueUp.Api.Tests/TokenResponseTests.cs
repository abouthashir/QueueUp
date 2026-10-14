using QueueUp.Api.Contracts;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class TokenResponseTests
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
    public void From_WaitingToken_ShowsPeopleAheadAndWait()
    {
        var queue = CreateOpenQueue();
        queue.Join("Anu", Morning);
        queue.Join("Rahul", Morning);
        var third = queue.Join("Meera", Morning);

        var response = TokenResponse.From(queue, third);

        Assert.Equal("A-003", response.DisplayNumber);
        Assert.Equal("General OPD", response.QueueName);
        Assert.Equal(2, response.PeopleAhead);
        Assert.Equal(10, response.EstimatedWaitMinutes);
    }

    [Fact]
    public void From_CalledToken_HasNobodyAheadAndNoWait()
    {
        var queue = CreateOpenQueue();
        var first = queue.Join("Anu", Morning);
        queue.CallNext("Counter 1", Morning);

        var response = TokenResponse.From(queue, first);

        Assert.Equal(TokenStatus.Called, response.Status);
        Assert.Equal("Counter 1", response.CounterName);
        Assert.Equal(0, response.PeopleAhead);
        Assert.Equal(0, response.EstimatedWaitMinutes);
    }
}
