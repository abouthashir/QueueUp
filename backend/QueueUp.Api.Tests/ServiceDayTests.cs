using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class ServiceDayTests
{
    [Fact]
    public void For_MorningInIndia_IsThatSameDate()
    {
        var morningInIndia = new DateTimeOffset(2026, 10, 15, 9, 0, 0, TimeSpan.FromHours(5.5));

        DateOnly day = ServiceDay.For(morningInIndia);

        Assert.Equal(new DateOnly(2026, 10, 15), day);
    }

    [Fact]
    public void For_LateEveningInUtc_IsAlreadyTheNextDayInIndia()
    {
        var eveningInUtc = new DateTimeOffset(2026, 10, 14, 20, 0, 0, TimeSpan.Zero);

        DateOnly day = ServiceDay.For(eveningInUtc);

        Assert.Equal(new DateOnly(2026, 10, 15), day);
    }
}
