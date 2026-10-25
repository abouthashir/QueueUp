namespace QueueUp.Api.Domain;

public class User
{
    public Guid Id { get; init; }
    public Guid BusinessId { get; init; }
    public required string Name { get; set; }
    public required string Email { get; init; }
    public string PasswordHash { get; set; } = "";
    public UserRole Role { get; init; }
    public required string CounterName { get; set; }

    public static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }
}
