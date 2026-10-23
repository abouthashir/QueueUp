using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace QueueUp.Api.Auth;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = "";
    public string Audience { get; init; } = "";
    public string SigningKey { get; init; } = "";
    public int LifetimeHours { get; init; } = 12;

    public SymmetricSecurityKey CreateSigningKey()
    {
        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey));
    }
}
