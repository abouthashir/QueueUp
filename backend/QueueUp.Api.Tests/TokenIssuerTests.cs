using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using QueueUp.Api.Auth;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class TokenIssuerTests
{
    private static readonly DateTimeOffset Morning = new(2026, 10, 15, 9, 0, 0, TimeSpan.FromHours(5.5));

    private static readonly JwtOptions Options = new()
    {
        Issuer = "QueueUp",
        Audience = "QueueUp",
        SigningKey = "test-signing-key-that-is-long-enough-1234",
        LifetimeHours = 12
    };

    private static readonly Business Clinic = new() { Id = Guid.NewGuid(), Name = "Sunrise Clinic" };

    private static readonly User Reshma = new()
    {
        Id = Guid.NewGuid(),
        BusinessId = Clinic.Id,
        Name = "Reshma",
        Email = "reshma@sunrise.in",
        Role = UserRole.Staff,
        CounterName = "Counter 2"
    };

    [Fact]
    public void Issue_PutsWhoTheUserIsIntoTheToken()
    {
        var response = new TokenIssuer(Options).Issue(Reshma, Clinic, Morning);

        var token = new JsonWebToken(response.Token);
        Assert.Equal(Reshma.Id.ToString(), token.GetClaim(AuthClaims.UserId).Value);
        Assert.Equal(Clinic.Id.ToString(), token.GetClaim(AuthClaims.BusinessId).Value);
        Assert.Equal("Staff", token.GetClaim(AuthClaims.Role).Value);
        Assert.Equal("Counter 2", token.GetClaim(AuthClaims.CounterName).Value);
        Assert.Equal("Sunrise Clinic", response.BusinessName);
    }

    [Fact]
    public void Issue_TokenExpiresAfterTheLifetime()
    {
        var response = new TokenIssuer(Options).Issue(Reshma, Clinic, Morning);

        var token = new JsonWebToken(response.Token);
        Assert.Equal(Morning.AddHours(12), response.ExpiresAt);
        Assert.Equal(Morning.AddHours(12).UtcDateTime, token.ValidTo);
    }

    [Fact]
    public async Task Issue_TokenSignedWithAnotherKey_IsRejected()
    {
        var response = new TokenIssuer(Options).Issue(Reshma, Clinic, Morning);
        var otherKey = Options.SigningKey.Replace("1234", "9999");

        var result = await new JsonWebTokenHandler().ValidateTokenAsync(response.Token, new TokenValidationParameters
        {
            ValidIssuer = Options.Issuer,
            ValidAudience = Options.Audience,
            IssuerSigningKey = new JwtOptions { SigningKey = otherKey }.CreateSigningKey(),
            ValidateLifetime = false
        });

        Assert.False(result.IsValid);
    }
}
