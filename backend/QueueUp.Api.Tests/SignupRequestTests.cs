using QueueUp.Api.Contracts;

namespace QueueUp.Api.Tests;

public class SignupRequestTests
{
    private static SignupRequest ValidRequest()
    {
        return new SignupRequest("Sunrise Clinic", "Anil", "anil@sunrise.in", "correct-horse", "Counter 1");
    }

    [Fact]
    public void FindProblem_ValidRequest_ReturnsNull()
    {
        Assert.Null(ValidRequest().FindProblem());
    }

    [Fact]
    public void FindProblem_ShortPassword_ExplainsTheMinimum()
    {
        var request = ValidRequest() with { Password = "1234567" };

        Assert.Equal("Choose a password with at least 8 characters.", request.FindProblem());
    }

    [Fact]
    public void FindProblem_EmailWithoutAt_IsRejected()
    {
        var request = ValidRequest() with { Email = "anil.sunrise.in" };

        Assert.Equal("Enter a valid email address.", request.FindProblem());
    }

    [Fact]
    public void FindProblem_BlankCounterName_IsRejected()
    {
        var request = ValidRequest() with { CounterName = "   " };

        Assert.Equal("Enter your counter name (up to 50 characters).", request.FindProblem());
    }
}
