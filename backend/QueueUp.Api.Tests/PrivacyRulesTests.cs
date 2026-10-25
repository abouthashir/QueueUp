using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class PrivacyRulesTests
{
    [Fact]
    public void ForgetNamesBefore_IsThirtyDaysBeforeTodayInIndia()
    {
        var lateEveningUtc = new DateTimeOffset(2026, 11, 20, 20, 0, 0, TimeSpan.Zero);

        var cutoff = PrivacyRules.ForgetNamesBefore(lateEveningUtc);

        Assert.Equal(new DateOnly(2026, 10, 22), cutoff);
    }
}
