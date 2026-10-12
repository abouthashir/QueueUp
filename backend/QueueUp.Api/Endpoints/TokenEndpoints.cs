using QueueUp.Api.Contracts;
using QueueUp.Api.Data;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Endpoints;

public static class TokenEndpoints
{
    public static void MapTokenEndpoints(this WebApplication app)
    {
        app.MapGet("/api/tokens/{tokenId:guid}", (Guid tokenId, QueueStore store) =>
        {
            Token? token = store.FindToken(tokenId);

            if (token == null)
            {
                return ApiErrors.TokenNotFound(tokenId);
            }

            Queue? queue = store.FindQueue(token.QueueId);

            if (queue == null)
            {
                return ApiErrors.QueueNotFound(token.QueueId);
            }

            return Results.Ok(TokenResponse.From(queue, token));
        });

        app.MapPost("/api/tokens/{tokenId:guid}/serve", (Guid tokenId, QueueStore store) =>
        {
            return ChangeToken(tokenId, store, token => token.Serve());
        });

        app.MapPost("/api/tokens/{tokenId:guid}/skip", (Guid tokenId, QueueStore store) =>
        {
            return ChangeToken(tokenId, store, token => token.Skip());
        });

        app.MapPost("/api/tokens/{tokenId:guid}/recall", (Guid tokenId, CounterRequest request, QueueStore store) =>
        {
            if (string.IsNullOrWhiteSpace(request.CounterName))
            {
                return Results.BadRequest(new { message = "Counter name is required." });
            }

            return ChangeToken(tokenId, store, token => token.Recall(request.CounterName));
        });

        app.MapPost("/api/tokens/{tokenId:guid}/cancel", (Guid tokenId, QueueStore store) =>
        {
            return ChangeToken(tokenId, store, token => token.Cancel());
        });
    }

    private static IResult ChangeToken(Guid tokenId, QueueStore store, Action<Token> change)
    {
        Token? token = store.FindToken(tokenId);

        if (token == null)
        {
            return ApiErrors.TokenNotFound(tokenId);
        }

        Queue? queue = store.FindQueue(token.QueueId);

        if (queue == null)
        {
            return ApiErrors.QueueNotFound(token.QueueId);
        }

        try
        {
            change(token);
            return Results.Ok(TokenResponse.From(queue, token));
        }
        catch (InvalidOperationException exception)
        {
            return ApiErrors.Conflict(exception);
        }
    }
}
