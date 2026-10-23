using QueueUp.Api.Domain;

namespace QueueUp.Api.Contracts;

// Never add PasswordHash here: password hashes must not leave the API.
public record StaffResponse(Guid Id, string Name, string Email, string CounterName)
{
    public static StaffResponse From(User user)
    {
        return new StaffResponse(user.Id, user.Name, user.Email, user.CounterName);
    }
}
