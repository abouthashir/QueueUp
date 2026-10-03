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

        var exception = Assert.Throws<InvalidOperationException>(() => token.Call("Counter 3"));

        Assert.Equal("Token A-014 cannot be called because it is Called.", exception.Message);
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

    [Fact]
    public void Skip_CalledToken_BecomesSkipped()
    {
        var token = CreateWaitingToken();
        token.Call("Counter 2");

        token.Skip();

        Assert.Equal(TokenStatus.Skipped, token.Status);
    }

    [Fact]
    public void Skip_WaitingToken_Throws()
    {
        var token = CreateWaitingToken();

        var exception = Assert.Throws<InvalidOperationException>(() => token.Skip());

        Assert.Equal("Token A-014 cannot be skipped because it is Waiting.", exception.Message);
    }

    [Fact]
    public void Recall_SkippedToken_BecomesCalledAtNewCounter()
    {
        var token = CreateWaitingToken();
        token.Call("Counter 2");
        token.Skip();

        token.Recall("Counter 1");

        Assert.Equal(TokenStatus.Called, token.Status);
        Assert.Equal("Counter 1", token.CounterName);
    }

    [Fact]
    public void Recall_CalledToken_Throws()
    {
        var token = CreateWaitingToken();
        token.Call("Counter 2");

        var exception = Assert.Throws<InvalidOperationException>(() => token.Recall("Counter 1"));

        Assert.Equal("Token A-014 cannot be recalled because it is Called.", exception.Message);
    }

    [Fact]
    public void Recall_CanHappenAnyNumberOfTimes()
    {
        var token = CreateWaitingToken();
        token.Call("Counter 2");

        token.Skip();
        token.Recall("Counter 2");
        token.Skip();
        token.Recall("Counter 2");

        Assert.Equal(TokenStatus.Called, token.Status);
    }

    [Fact]
    public void Cancel_WaitingToken_BecomesCancelled()
    {
        var token = CreateWaitingToken();

        token.Cancel();

        Assert.Equal(TokenStatus.Cancelled, token.Status);
    }

    [Fact]
    public void Cancel_CalledToken_Throws()
    {
        var token = CreateWaitingToken();
        token.Call("Counter 2");

        var exception = Assert.Throws<InvalidOperationException>(() => token.Cancel());

        Assert.Equal("Token A-014 cannot be cancelled because it is Called.", exception.Message);
    }
}
