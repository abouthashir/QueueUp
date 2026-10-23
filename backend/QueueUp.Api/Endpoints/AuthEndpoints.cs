using Microsoft.AspNetCore.Identity;
using QueueUp.Api.Auth;
using QueueUp.Api.Contracts;
using QueueUp.Api.Data;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/api/auth/signup", async (SignupRequest request, QueueStore store, IPasswordHasher<User> hasher, TokenIssuer issuer, TimeProvider clock) =>
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

            var business = new Business { Id = Guid.NewGuid(), Name = request.BusinessName.Trim() };

            var owner = new User
            {
                Id = Guid.NewGuid(),
                BusinessId = business.Id,
                Name = request.Name.Trim(),
                Email = email,
                Role = UserRole.Owner,
                CounterName = request.CounterName.Trim()
            };
            owner.PasswordHash = hasher.HashPassword(owner, request.Password);

            store.AddBusiness(business);
            store.AddUser(owner);

            if (!await store.TrySaveChangesAsync())
            {
                return ApiErrors.EmailTaken();
            }

            return Results.Ok(issuer.Issue(owner, business, clock.GetUtcNow()));
        });

        app.MapPost("/api/auth/login", async (LoginRequest request, QueueStore store, IPasswordHasher<User> hasher, TokenIssuer issuer, TimeProvider clock) =>
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return ApiErrors.WrongLogin();
            }

            User? user = await store.FindUserByEmailAsync(User.NormalizeEmail(request.Email));

            if (user == null || hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
            {
                return ApiErrors.WrongLogin();
            }

            Business? business = await store.FindBusinessAsync(user.BusinessId);

            if (business == null)
            {
                return ApiErrors.WrongLogin();
            }

            return Results.Ok(issuer.Issue(user, business, clock.GetUtcNow()));
        });
    }
}
