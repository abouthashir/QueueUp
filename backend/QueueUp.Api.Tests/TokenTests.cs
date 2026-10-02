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

        [Fact]
    public void Call_TokenAlreadyCalled_Throws()
    {
        var token = CreateWaitingToken();
        token.Call("Counter 2");

        Assert.Throws<InvalidOperationException>(() => token.Call("Counter 3"));
    }
    
    [Fact]
    public void Serve_CalledToken_BecomesServed()
    {
        var token = CreateWaitingToken();
        token.Call("Counter 2");

        token.Serve();

        Assert.Equal(TokenStatus.Served, token.Status);
    }

    [Fact]
    public void Serve_WaitingToken_Throws()
    {
        var token = CreateWaitingToken();

        var exception = Assert.Throws<InvalidOperationException>(() => token.Serve());

        Assert.Equal("Token A-014 cannot be served because it is Waiting.", exception.Message);
    }

}
