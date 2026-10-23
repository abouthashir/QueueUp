using System.Security.Claims;
using QueueUp.Api.Auth;
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
        app.MapGet("/api/queues", async (ClaimsPrincipal user, QueueStore store, TimeProvider clock) =>
        {
            List<Queue> queues = await store.GetQueuesForBusinessAsync(user.GetBusinessId());
            DateTimeOffset now = clock.GetUtcNow();

            return queues.Select(queue => QueueResponse.From(queue, now)).ToList();
        }).RequireAuthorization();

        app.MapPost("/api/queues", async (CreateQueueRequest request, ClaimsPrincipal user, QueueStore store, TimeProvider clock) =>
        {
            string? problem = request.FindProblem();

            if (problem != null)
            {
                return Results.BadRequest(new { message = problem });
            }

            var queue = new Queue
            {
                Id = Guid.NewGuid(),
                BusinessId = user.GetBusinessId(),
                Name = request.Name.Trim(),
                Prefix = char.ToUpperInvariant(request.Prefix),
                AverageServiceMinutes = request.AverageServiceMinutes
            };

            store.AddQueue(queue);
            await store.SaveChangesAsync();

            return Results.Created($"/api/queues/{queue.Id}", QueueResponse.From(queue, clock.GetUtcNow()));
        }).RequireAuthorization(AuthPolicies.OwnerOnly);

        app.MapGet("/api/queues/{queueId:guid}", async (Guid queueId, QueueStore store, TimeProvider clock) =>
        {
            Queue? queue = await store.FindQueueAsync(queueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            return Results.Ok(QueueResponse.From(queue, clock.GetUtcNow()));
        });

        app.MapGet("/api/queues/{queueId:guid}/dashboard", async (Guid queueId, ClaimsPrincipal user, QueueStore store, TimeProvider clock) =>
        {
            Queue? queue = await store.FindQueueForBusinessAsync(queueId, user.GetBusinessId());

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            return Results.Ok(DashboardResponse.From(queue, user.GetCounterName(), clock.GetUtcNow()));
        }).RequireAuthorization();

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

        app.MapPost("/api/queues/{queueId:guid}/pause", async (Guid queueId, ClaimsPrincipal user, QueueStore store, QueueNotifier notifier, TimeProvider clock) =>
        {
            Queue? queue = await store.FindQueueForBusinessAsync(queueId, user.GetBusinessId());

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            queue.Pause();
            await store.SaveChangesAsync();
            await notifier.QueueChangedAsync(queueId);
            return Results.Ok(QueueResponse.From(queue, clock.GetUtcNow()));
        }).RequireAuthorization();

        app.MapPost("/api/queues/{queueId:guid}/open", async (Guid queueId, ClaimsPrincipal user, QueueStore store, QueueNotifier notifier, TimeProvider clock) =>
        {
            Queue? queue = await store.FindQueueForBusinessAsync(queueId, user.GetBusinessId());

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(queueId);
            }

            queue.Open();
            await store.SaveChangesAsync();
            await notifier.QueueChangedAsync(queueId);
            return Results.Ok(QueueResponse.From(queue, clock.GetUtcNow()));
        }).RequireAuthorization();

        app.MapPost("/api/queues/{queueId:guid}/close", async (Guid queueId, ClaimsPrincipal user, QueueStore store, QueueNotifier notifier, TimeProvider clock) =>
        {
            Queue? queue = await store.FindQueueForBusinessAsync(queueId, user.GetBusinessId());

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
        }).RequireAuthorization();

        app.MapPost("/api/queues/{queueId:guid}/call-next", async (Guid queueId, ClaimsPrincipal user, QueueStore store, QueueNotifier notifier, TimeProvider clock) =>
        {
            string counterName = user.GetCounterName();

            for (int attempt = 1; attempt <= MaxAttempts; attempt++)
            {
                Queue? queue = await store.FindQueueForBusinessAsync(queueId, user.GetBusinessId());

                if (queue == null)
                {
                    return ApiErrors.QueueNotFound(queueId);
                }

                Token? token;

                try
                {
                    token = queue.CallNext(counterName, clock.GetUtcNow());
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
        }).RequireAuthorization();
    }
}
