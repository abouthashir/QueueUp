using QueueUp.Api.Contracts;
using QueueUp.Api.Data;
using QueueUp.Api.Domain;
using QueueUp.Api.Hubs;

namespace QueueUp.Api.Endpoints;

public static class TokenEndpoints
{
    public static void MapTokenEndpoints(this WebApplication app)
    {
        app.MapGet("/api/tokens/{tokenId:guid}", async (Guid tokenId, QueueStore store) =>
        {
            Token? token = await store.FindTokenAsync(tokenId);

            if (token == null)
            {
                return ApiErrors.TokenNotFound(tokenId);
            }

            Queue? queue = await store.FindQueueAsync(token.QueueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(token.QueueId);
            }

            return Results.Ok(TokenResponse.From(queue, token));
        });

        app.MapPost("/api/tokens/{tokenId:guid}/serve", async (Guid tokenId, QueueStore store, QueueNotifier notifier) =>
        {
            return await ChangeTokenAsync(tokenId, store, notifier, (_, token) => token.Serve());
        });

        app.MapPost("/api/tokens/{tokenId:guid}/skip", async (Guid tokenId, QueueStore store, QueueNotifier notifier) =>
        {
            return await ChangeTokenAsync(tokenId, store, notifier, (_, token) => token.Skip());
        });

        app.MapPost("/api/tokens/{tokenId:guid}/recall", async (Guid tokenId, CounterRequest request, QueueStore store, QueueNotifier notifier) =>
        {
            if (string.IsNullOrWhiteSpace(request.CounterName))
            {
                return Results.BadRequest(new { message = "Counter name is required." });
            }

            return await ChangeTokenAsync(tokenId, store, notifier, (queue, token) => queue.Recall(token, request.CounterName));
        });

        app.MapPost("/api/tokens/{tokenId:guid}/cancel", async (Guid tokenId, QueueStore store, QueueNotifier notifier) =>
        {
            return await ChangeTokenAsync(tokenId, store, notifier, (_, token) => token.Cancel());
        });
    }

    private static async Task<IResult> ChangeTokenAsync(Guid tokenId, QueueStore store, QueueNotifier notifier, Action<Queue, Token> change)
    {
        Token? token = await store.FindTokenAsync(tokenId);

        if (token == null)
        {
            return ApiErrors.TokenNotFound(tokenId);
        }

        Queue? queue = await store.FindQueueAsync(token.QueueId);

        if (queue == null)
        {
            return ApiErrors.QueueNotFound(token.QueueId);
        }

        try
        {
            change(queue, token);

            if (!await store.TrySaveChangesAsync())
            {
                await notifier.QueueChangedAsync(queue.Id);
                return ApiErrors.TokenChanged();
            }

            return Results.Ok(TokenResponse.From(queue, token));
        }
        catch (InvalidOperationException exception)
        {
            return ApiErrors.Conflict(exception);
        }
    }
}
