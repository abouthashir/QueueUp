using System.Security.Claims;

namespace QueueUp.Api.Auth;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetBusinessId(this ClaimsPrincipal user)
    {
        return Guid.Parse(GetRequiredClaim(user, AuthClaims.BusinessId));
    }

    public static string GetCounterName(this ClaimsPrincipal user)
    {
        return GetRequiredClaim(user, AuthClaims.CounterName);
    }

    private static string GetRequiredClaim(ClaimsPrincipal user, string claimType)
    {
        return user.FindFirstValue(claimType)
            ?? throw new InvalidOperationException($"The login token has no '{claimType}' claim.");
    }
}
