using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class UserTests
{
    [Fact]
    public void NormalizeEmail_TrimsAndLowercases()
    {
        Assert.Equal("reshma@sunrise.in", User.NormalizeEmail("  Reshma@Sunrise.IN "));
    }
}
