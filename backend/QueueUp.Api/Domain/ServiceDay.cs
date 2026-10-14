namespace QueueUp.Api.Domain;

public static class ServiceDay
{
    private static readonly TimeSpan IndiaOffset = new(5, 30, 0);

    public static DateOnly For(DateTimeOffset moment)
    {
        return DateOnly.FromDateTime(moment.ToOffset(IndiaOffset).DateTime);
    }
}
