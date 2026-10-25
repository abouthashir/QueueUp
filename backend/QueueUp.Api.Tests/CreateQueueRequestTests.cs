using QueueUp.Api.Contracts;

namespace QueueUp.Api.Tests;

public class CreateQueueRequestTests
{
    [Fact]
    public void FindProblem_ValidRequest_ReturnsNull()
    {
        Assert.Null(new CreateQueueRequest("Pharmacy", 'B', 4).FindProblem());
    }

    [Fact]
    public void FindProblem_PrefixThatIsNotALetter_IsRejected()
    {
        var request = new CreateQueueRequest("Pharmacy", '7', 4);

        Assert.Equal("The token prefix must be a single letter, such as A.", request.FindProblem());
    }

    [Fact]
    public void FindProblem_ZeroMinutes_IsRejected()
    {
        var request = new CreateQueueRequest("Pharmacy", 'B', 0);

        Assert.Equal("The average service time must be between 1 and 120 minutes.", request.FindProblem());
    }

    [Fact]
    public void FindProblem_DailyLimitOfZero_IsRejected()
    {
        var request = new CreateQueueRequest("Pharmacy", 'B', 4, DailyTokenLimit: 0);

        Assert.Equal("The daily token limit must be between 1 and 1000, or left empty for no limit.", request.FindProblem());
    }
}
