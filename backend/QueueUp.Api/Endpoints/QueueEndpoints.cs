using QueueUp.Api.Contracts;
using QueueUp.Api.Data;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Endpoints;

public static class QueueEndpoints
{
    public static void MapQueueEndpoints(this WebApplication app)
    {
        app.MapGet("/api/queues", (QueueStore store) =>
        {
            return store.GetAll();
        });

        app.MapGet("/api/queues/{queueId:guid}", (Guid queueId, QueueStore store) =>
        {
            Queue? queue = store.FindQueue(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            return Results.Ok(queue);
        });

        app.MapPost("/api/queues/{queueId:guid}/tokens", (Guid queueId, JoinQueueRequest request, QueueStore store) =>
        {
            Queue? queue = store.FindQueue(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            try
            {
                Token token = queue.Join(request.CustomerName);
                return Results.Created($"/api/tokens/{token.Id}", TokenResponse.From(queue, token));
            }
            catch (InvalidOperationException exception)
            {
                return ApiErrors.Conflict(exception);
            }
        });

        app.MapPost("/api/queues/{queueId:guid}/pause", (Guid queueId, QueueStore store) =>
        {
            Queue? queue = store.FindQueue(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            queue.Pause();
            return Results.Ok(queue);
        });

        app.MapPost("/api/queues/{queueId:guid}/open", (Guid queueId, QueueStore store) =>
        {
            Queue? queue = store.FindQueue(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            queue.Open();
            return Results.Ok(queue);
        });

        app.MapPost("/api/queues/{queueId:guid}/call-next", (Guid queueId, CounterRequest request, QueueStore store) =>
{
    if (string.IsNullOrWhiteSpace(request.CounterName))
    {
        return Results.BadRequest(new { message = "Counter name is required." });
    }

    Queue? queue = store.FindQueue(queueId);

    if (queue == null)
    {
        return ApiErrors.QueueNotFound(queueId);
    }

    try
    {
        Token? token = queue.CallNext(request.CounterName);

        if (token == null)
        {
            return Results.NoContent();
        }

        return Results.Ok(TokenResponse.From(queue, token));
    }
    catch (InvalidOperationException exception)
    {
        return ApiErrors.Conflict(exception);
    }
});
    }
}
