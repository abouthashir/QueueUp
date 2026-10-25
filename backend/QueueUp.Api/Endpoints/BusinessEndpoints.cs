using System.Security.Claims;
using QueueUp.Api.Auth;
using QueueUp.Api.Contracts;
using QueueUp.Api.Data;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Endpoints;

public static class BusinessEndpoints
{
    public static void MapBusinessEndpoints(this WebApplication app)
    {
        app.MapGet("/api/business", async (ClaimsPrincipal user, QueueStore store) =>
        {
            Business? business = await store.FindBusinessAsync(user.GetBusinessId());

            if (business == null)
            {
                return ApiErrors.BusinessNotFound();
            }

            return Results.Ok(BusinessProfileResponse.From(business));
        }).RequireAuthorization(AuthPolicies.OwnerOnly);

        app.MapPut("/api/business", async (UpdateBusinessRequest request, ClaimsPrincipal user, QueueStore store) =>
        {
            string? problem = request.FindProblem();

            if (problem != null)
            {
                return Results.BadRequest(new { message = problem });
            }

            Business? business = await store.FindBusinessAsync(user.GetBusinessId());

            if (business == null)
            {
                return ApiErrors.BusinessNotFound();
            }

            business.Name = request.Name.Trim();
            business.Type = request.Type;
            business.Address = request.Address?.Trim() ?? "";
            business.OpeningHours = request.OpeningHours?.Trim() ?? "";
            await store.SaveChangesAsync();

            return Results.Ok(BusinessProfileResponse.From(business));
        }).RequireAuthorization(AuthPolicies.OwnerOnly);
    }
}
