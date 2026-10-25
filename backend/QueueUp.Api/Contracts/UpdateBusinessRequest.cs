using QueueUp.Api.Domain;

namespace QueueUp.Api.Contracts;

public record UpdateBusinessRequest(string Name, BusinessType Type, string? Address, string? OpeningHours)
{
    public string? FindProblem()
    {
        if (string.IsNullOrWhiteSpace(Name) || Name.Trim().Length > 100)
        {
            return "Enter your business name (up to 100 characters).";
        }

        if (!Enum.IsDefined(Type))
        {
            return "Choose a business type: Clinic, Bank, Salon or Other.";
        }

        if (Address?.Trim().Length > 200)
        {
            return "Keep the address under 200 characters.";
        }

        if (OpeningHours?.Trim().Length > 100)
        {
            return "Keep the opening hours under 100 characters.";
        }

        return null;
    }
}
