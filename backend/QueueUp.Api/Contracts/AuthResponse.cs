using QueueUp.Api.Domain;

namespace QueueUp.Api.Contracts;

public record AuthResponse(
    string Token,
    DateTimeOffset ExpiresAt,
    string Name,
    UserRole Role,
    string CounterName,
    string BusinessName);
