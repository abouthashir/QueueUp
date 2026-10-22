namespace QueueUp.Api.Endpoints;

public static class ApiErrors
{
    public static IResult QueueNotFound(Guid queueId)
    {
        return Results.NotFound(new { message = $"Queue {queueId} was not found." });
    }

    public static IResult TokenNotFound(Guid tokenId)
    {
        return Results.NotFound(new { message = $"Token {tokenId} was not found." });
    }

    public static IResult Conflict(InvalidOperationException exception)
    {
        return Results.Conflict(new { message = exception.Message });
    }

    public static IResult Busy()
    {
        return Results.Conflict(new { message = "Many people are using the queue right now. Please try again." });
    }

    public static IResult TokenChanged()
    {
        return Results.Conflict(new { message = "This token was just changed by someone else. Please refresh and try again." });
    }
}
