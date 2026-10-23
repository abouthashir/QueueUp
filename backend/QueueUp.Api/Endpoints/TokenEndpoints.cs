using System.Security.Claims;
using QueueUp.Api.Auth;
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

        app.MapPost("/api/tokens/{tokenId:guid}/serve", async (Guid tokenId, ClaimsPrincipal user, QueueStore store, QueueNotifier notifier) =>
        {
            return await ChangeTokenAsync(tokenId, user.GetBusinessId(), store, notifier, (_, token) => token.Serve());
        }).RequireAuthorization();

        app.MapPost("/api/tokens/{tokenId:guid}/skip", async (Guid tokenId, ClaimsPrincipal user, QueueStore store, QueueNotifier notifier) =>
        {
            return await ChangeTokenAsync(tokenId, user.GetBusinessId(), store, notifier, (_, token) => token.Skip());
        }).RequireAuthorization();

        app.MapPost("/api/tokens/{tokenId:guid}/recall", async (Guid tokenId, ClaimsPrincipal user, QueueStore store, QueueNotifier notifier) =>
        {
            string counterName = user.GetCounterName();
            return await ChangeTokenAsync(tokenId, user.GetBusinessId(), store, notifier, (queue, token) => queue.Recall(token, counterName));
        }).RequireAuthorization();

        app.MapPost("/api/tokens/{tokenId:guid}/cancel", async (Guid tokenId, QueueStore store, QueueNotifier notifier) =>
        {
            return await ChangeTokenAsync(tokenId, null, store, notifier, (_, token) => token.Cancel());
        });
    }

    private static async Task<IResult> ChangeTokenAsync(Guid tokenId, Guid? staffBusinessId, QueueStore store, QueueNotifier notifier, Action<Queue, Token> change)
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

        if (staffBusinessId != null && queue.BusinessId != staffBusinessId)
        {
            return ApiErrors.TokenNotFound(tokenId);
        }

        try
        {
            change(queue, token);

            if (!await store.TrySaveChangesAsync())
            {
                return ApiErrors.TokenChanged();
            }

            await notifier.QueueChangedAsync(queue.Id);
            return Results.Ok(TokenResponse.From(queue, token));
        }
        catch (InvalidOperationException exception)
        {
            return ApiErrors.Conflict(exception);
        }
    }
}
