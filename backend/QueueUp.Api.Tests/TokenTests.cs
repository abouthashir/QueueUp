using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class TokenTests
{
    private static Token CreateWaitingToken()
    {
        return new Token
        {
            Id = Guid.NewGuid(),
            Prefix = 'A',
            Number = 14,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    [Fact]
    public void NewToken_StartsAsWaiting()
    {
        var token = CreateWaitingToken();

        Assert.Equal(TokenStatus.Waiting, token.Status);
    }

    [Fact]
    public void Call_WaitingToken_BecomesCalledAtCounter()
    {
        var token = CreateWaitingToken();

        token.Call("Counter 2");

        Assert.Equal(TokenStatus.Called, token.Status);
        Assert.Equal("Counter 2", token.CounterName);
    }
}
