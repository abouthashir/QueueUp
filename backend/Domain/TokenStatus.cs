namespace QueueUp.Api.Domain;

public enum TokenStatus
{
    Waiting,
    Called,
    Served,
    Skipped,
    Cancelled,
    NoShow
}
