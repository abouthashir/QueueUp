using QueueUp.Api.Domain;

namespace QueueUp.Api.Contracts;

public record BusinessProfileResponse(string Name, BusinessType Type, string Address, string OpeningHours)
{
    public static BusinessProfileResponse From(Business business)
    {
        return new BusinessProfileResponse(business.Name, business.Type, business.Address, business.OpeningHours);
    }
}
