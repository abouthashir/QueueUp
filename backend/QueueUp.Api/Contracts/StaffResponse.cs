using QueueUp.Api.Domain;

namespace QueueUp.Api.Contracts;

public record StaffResponse(Guid Id, string Name, string Email, string CounterName)
{
    public static StaffResponse From(User user)
    {
        return new StaffResponse(user.Id, user.Name, user.Email, user.CounterName);
    }
}
