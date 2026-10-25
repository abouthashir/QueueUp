namespace QueueUp.Api.Security;

public class RateLimitOptions
{
    public const string SectionName = "RateLimits";
    public const string AuthPolicy = "auth";
    public const string JoinPolicy = "join";

    public int AuthAttemptsPerFiveMinutes { get; init; } = 10;
    public int JoinsPerMinute { get; init; } = 20;

    public static string ClientKey(HttpContext context)
    {
        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
