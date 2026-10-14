using QueueUp.Api.Contracts;
using QueueUp.Api.Data;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Endpoints;

public static class QueueEndpoints
{
    public static void MapQueueEndpoints(this WebApplication app)
    {
        app.MapGet("/api/queues", async (QueueStore store) =>
        {
            return await store.GetAllAsync();
        });

        app.MapGet("/api/queues/{queueId:guid}", async (Guid queueId, QueueStore store) =>
        {
            Queue? queue = await store.FindQueueAsync(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            return Results.Ok(queue);
        });

        app.MapPost("/api/queues/{queueId:guid}/tokens", async (Guid queueId, JoinQueueRequest request, QueueStore store, TimeProvider clock) =>
        {
            Queue? queue = await store.FindQueueAsync(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            try
            {
                Token token = queue.Join(request.CustomerName, clock.GetUtcNow());
                await store.SaveChangesAsync();
                return Results.Created($"/api/tokens/{token.Id}", TokenResponse.From(queue, token));
            }
            catch (InvalidOperationException exception)
            {
                return ApiErrors.Conflict(exception);
            }
        });

        app.MapPost("/api/queues/{queueId:guid}/pause", async (Guid queueId, QueueStore store) =>
        {
            Queue? queue = await store.FindQueueAsync(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            queue.Pause();
            await store.SaveChangesAsync();
            return Results.Ok(queue);
        });

        app.MapPost("/api/queues/{queueId:guid}/open", async (Guid queueId, QueueStore store) =>
        {
            Queue? queue = await store.FindQueueAsync(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            queue.Open();
            await store.SaveChangesAsync();
            return Results.Ok(queue);
        });

        app.MapPost("/api/queues/{queueId:guid}/call-next", async (Guid queueId, CounterRequest request, QueueStore store, TimeProvider clock) =>
        {
            if (string.IsNullOrWhiteSpace(request.CounterName))
            {
                return Results.BadRequest(new { message = "Counter name is required." });
            }

            Queue? queue = await store.FindQueueAsync(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            try
            {
                Token? token = queue.CallNext(request.CounterName, clock.GetUtcNow());

                if (token == null)
                {
                    return Results.NoContent();
                }

                await store.SaveChangesAsync();

                return Results.Ok(TokenResponse.From(queue, token));
            }
            catch (InvalidOperationException exception)
            {
                return ApiErrors.Conflict(exception);
            }
        });
    }
}
