using QueueUp.Api.Domain;

namespace QueueUp.Api.Contracts;

public record TokenSummary(Guid Id, string DisplayNumber, string? CustomerName)
{
    public static TokenSummary From(Token token)
    {
        return new TokenSummary(token.Id, token.DisplayNumber, token.CustomerName);
    }
}
