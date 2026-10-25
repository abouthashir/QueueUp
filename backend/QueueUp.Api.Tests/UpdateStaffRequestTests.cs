using QueueUp.Api.Contracts;

namespace QueueUp.Api.Tests;

public class UpdateStaffRequestTests
{
    [Fact]
    public void FindProblem_ValidRequest_ReturnsNull()
    {
        Assert.Null(new UpdateStaffRequest("Reshma", "Counter 3").FindProblem());
    }

    [Fact]
    public void FindProblem_BlankCounterName_IsRejected()
    {
        var request = new UpdateStaffRequest("Reshma", " ");

        Assert.Equal("Enter a counter name (up to 50 characters).", request.FindProblem());
    }
}
