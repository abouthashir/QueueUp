using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using QueueUp.Api.Contracts;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Auth;

public class TokenIssuer
{
    private readonly JwtOptions _options;

    public TokenIssuer(JwtOptions options)
    {
        _options = options;
    }

    public AuthResponse Issue(User user, Business business, DateTimeOffset now)
    {
        DateTimeOffset expiresAt = now.AddHours(_options.LifetimeHours);

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            IssuedAt = now.UtcDateTime,
            NotBefore = now.UtcDateTime,
            Expires = expiresAt.UtcDateTime,
            SigningCredentials = new SigningCredentials(_options.CreateSigningKey(), SecurityAlgorithms.HmacSha256),
            Claims = new Dictionary<string, object>
            {
                [AuthClaims.UserId] = user.Id.ToString(),
                [AuthClaims.BusinessId] = user.BusinessId.ToString(),
                [AuthClaims.Name] = user.Name,
                [AuthClaims.Role] = user.Role.ToString(),
                [AuthClaims.CounterName] = user.CounterName
            }
        };

        string token = new JsonWebTokenHandler().CreateToken(descriptor);

        return new AuthResponse(token, expiresAt, user.Name, user.Role, user.CounterName, business.Name);
    }
}
