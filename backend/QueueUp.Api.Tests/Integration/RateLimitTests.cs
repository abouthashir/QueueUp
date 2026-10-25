using System.Net;
using System.Net.Http.Json;
using QueueUp.Api.Contracts;

namespace QueueUp.Api.Tests.Integration;

public class StrictLimitApiFactory : QueueUpApiFactory
{
    protected override int AuthAttemptsPerFiveMinutes => 3;
}

public class RateLimitTests : IClassFixture<StrictLimitApiFactory>
{
    private readonly StrictLimitApiFactory _factory;

    public RateLimitTests(StrictLimitApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task TooManyLoginAttempts_AreSlowedDown()
    {
        HttpClient client = _factory.CreateClient();
        var guess = new LoginRequest("someone@sunrise.test", "wrong-password");

        var statuses = new List<HttpStatusCode>();
        for (int attempt = 0; attempt < 4; attempt++)
        {
            statuses.Add((await client.PostAsJsonAsync("/api/auth/login", guess)).StatusCode);
        }

        Assert.Equal(
            new[] { HttpStatusCode.Unauthorized, HttpStatusCode.Unauthorized, HttpStatusCode.Unauthorized, HttpStatusCode.TooManyRequests },
            statuses);
    }
}
