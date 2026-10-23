using QueueUp.Api.Contracts;
using QueueUp.Api.Data;
using QueueUp.Api.Domain;
using QueueUp.Api.Hubs;

namespace QueueUp.Api.Endpoints;

public static class QueueEndpoints
{
    private const int MaxAttempts = 5;

    public static void MapQueueEndpoints(this WebApplication app)
    {
        app.MapGet("/api/queues", async (QueueStore store) =>
        {
            return await store.GetAllAsync();
        });

        app.MapGet("/api/queues/{queueId:guid}", async (Guid queueId, QueueStore store, TimeProvider clock) =>
        {
            Queue? queue = await store.FindQueueAsync(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            return Results.Ok(QueueResponse.From(queue, clock.GetUtcNow()));
        });

        app.MapGet("/api/queues/{queueId:guid}/dashboard", async (Guid queueId, string? counterName, QueueStore store, TimeProvider clock) =>
        {
            if (string.IsNullOrWhiteSpace(counterName))
            {
                return Results.BadRequest(new { message = "Counter name is required." });
            }

            Queue? queue = await store.FindQueueAsync(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            return Results.Ok(DashboardResponse.From(queue, counterName, clock.GetUtcNow()));
        });

        app.MapPost("/api/queues/{queueId:guid}/tokens", async (Guid queueId, JoinQueueRequest request, QueueStore store, QueueNotifier notifier, TimeProvider clock) =>
        {
            for (int attempt = 1; attempt <= MaxAttempts; attempt++)
            {
                Queue? queue = await store.FindQueueAsync(queueId);

                if (queue == null)
                {
                    return ApiErrors.QueueNotFound(queueId);
                }

                Token token;

                try
                {
                    token = queue.Join(request.CustomerName, clock.GetUtcNow());
                }
                catch (InvalidOperationException exception)
                {
                    return ApiErrors.Conflict(exception);
                }

                if (await store.TrySaveChangesAsync())
                {
                    await notifier.QueueChangedAsync(queueId);
                    return Results.Created($"/api/tokens/{token.Id}", TokenResponse.From(queue, token));
                }
            }

            return ApiErrors.Busy();
        });

        app.MapPost("/api/queues/{queueId:guid}/pause", async (Guid queueId, QueueStore store, QueueNotifier notifier, TimeProvider clock) =>
        {
            Queue? queue = await store.FindQueueAsync(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            queue.Pause();
            await store.SaveChangesAsync();
            await notifier.QueueChangedAsync(queueId);
            return Results.Ok(QueueResponse.From(queue, clock.GetUtcNow()));
        });

        app.MapPost("/api/queues/{queueId:guid}/open", async (Guid queueId, QueueStore store, QueueNotifier notifier, TimeProvider clock) =>
        {
            Queue? queue = await store.FindQueueAsync(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            queue.Open();
            await store.SaveChangesAsync();
            await notifier.QueueChangedAsync(queueId);
            return Results.Ok(QueueResponse.From(queue, clock.GetUtcNow()));
        });

        app.MapPost("/api/queues/{queueId:guid}/close", async (Guid queueId, QueueStore store, QueueNotifier notifier, TimeProvider clock) =>
        {
            Queue? queue = await store.FindQueueAsync(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            try
            {
                queue.Close();
                await store.SaveChangesAsync();
                await notifier.QueueChangedAsync(queueId);
                return Results.Ok(QueueResponse.From(queue, clock.GetUtcNow()));
            }
            catch (InvalidOperationException exception)
            {
                return ApiErrors.Conflict(exception);
            }
        });

        app.MapPost("/api/queues/{queueId:guid}/call-next", async (Guid queueId, CounterRequest request, QueueStore store, QueueNotifier notifier, TimeProvider clock) =>
        {
            if (string.IsNullOrWhiteSpace(request.CounterName))
            {
                return Results.BadRequest(new { message = "Counter name is required." });
            }

            for (int attempt = 1; attempt <= MaxAttempts; attempt++)
            {
                Queue? queue = await store.FindQueueAsync(queueId);

                if (queue == null)
                {
                    return ApiErrors.QueueNotFound(queueId);
                }

                Token? token;

                try
                {
                    token = queue.CallNext(request.CounterName, clock.GetUtcNow());
                }
                catch (InvalidOperationException exception)
                {
                    return ApiErrors.Conflict(exception);
                }

                if (token == null)
                {
                    return Results.NoContent();
                }

                if (await store.TrySaveChangesAsync())
                {
                    await notifier.QueueChangedAsync(queueId);
                    return Results.Ok(TokenResponse.From(queue, token));
                }
            }

            return ApiErrors.Busy();
        });
    }
}
