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
    }
}
