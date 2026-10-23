using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using QueueUp.Api.Auth;
using QueueUp.Api.Contracts;
using QueueUp.Api.Data;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Endpoints;

public static class StaffEndpoints
{
    public static void MapStaffEndpoints(this WebApplication app)
    {
        app.MapPost("/api/staff", async (CreateStaffRequest request, ClaimsPrincipal user, QueueStore store, IPasswordHasher<User> hasher) =>
        {
            string? problem = request.FindProblem();

            if (problem != null)
            {
                return Results.BadRequest(new { message = problem });
            }

            string email = User.NormalizeEmail(request.Email);

            if (await store.EmailExistsAsync(email))
            {
                return ApiErrors.EmailTaken();
            }

            var staff = new User
            {
                Id = Guid.NewGuid(),
                BusinessId = user.GetBusinessId(),
                Name = request.Name.Trim(),
                Email = email,
                Role = UserRole.Staff,
                CounterName = request.CounterName.Trim()
            };
            staff.PasswordHash = hasher.HashPassword(staff, request.Password);

            store.AddUser(staff);

            if (!await store.TrySaveChangesAsync())
            {
                return ApiErrors.EmailTaken();
            }

            return Results.Created($"/api/staff/{staff.Id}", StaffResponse.From(staff));
        }).RequireAuthorization(AuthPolicies.OwnerOnly);
    }
}
