namespace QueueUp.Api.Domain;

public static class ServiceDay
{
    private static readonly TimeSpan IndiaOffset = new(5, 30, 0);

    // The business day a moment belongs to, in IST: 20:00 UTC on Nov 20 is already Nov 21 in India.
    public static DateOnly For(DateTimeOffset moment)
    {
        return DateOnly.FromDateTime(moment.ToOffset(IndiaOffset).DateTime);
    }
}
