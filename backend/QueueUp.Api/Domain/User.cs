namespace QueueUp.Api.Domain;

public class User
{
    public Guid Id { get; init; }
    public Guid BusinessId { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public string PasswordHash { get; set; } = "";
    public UserRole Role { get; init; }
    public required string CounterName { get; init; }

    public static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }
}
