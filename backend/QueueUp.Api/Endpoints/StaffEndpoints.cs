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
        app.MapGet("/api/staff", async (ClaimsPrincipal user, QueueStore store) =>
        {
            List<User> staff = await store.GetStaffAsync(user.GetBusinessId());
            return staff.Select(StaffResponse.From).ToList();
        }).RequireAuthorization(AuthPolicies.OwnerOnly);

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

        app.MapPut("/api/staff/{staffId:guid}", async (Guid staffId, UpdateStaffRequest request, ClaimsPrincipal user, QueueStore store) =>
        {
            string? problem = request.FindProblem();

            if (problem != null)
            {
                return Results.BadRequest(new { message = problem });
            }

            User? staff = await store.FindStaffAsync(staffId, user.GetBusinessId());

            if (staff == null)
            {
                return ApiErrors.StaffNotFound(staffId);
            }

            staff.Name = request.Name.Trim();
            staff.CounterName = request.CounterName.Trim();
            await store.SaveChangesAsync();

            return Results.Ok(StaffResponse.From(staff));
        }).RequireAuthorization(AuthPolicies.OwnerOnly);

        app.MapDelete("/api/staff/{staffId:guid}", async (Guid staffId, ClaimsPrincipal user, QueueStore store) =>
        {
            User? staff = await store.FindStaffAsync(staffId, user.GetBusinessId());

            if (staff == null)
            {
                return ApiErrors.StaffNotFound(staffId);
            }

            store.RemoveUser(staff);
            await store.SaveChangesAsync();

            return Results.NoContent();
        }).RequireAuthorization(AuthPolicies.OwnerOnly);
    }
}
