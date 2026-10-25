namespace QueueUp.Api.Domain;

public class Business
{
    public Guid Id { get; init; }
    public required string Name { get; set; }
    public BusinessType Type { get; set; } = BusinessType.Other;
    public string Address { get; set; } = "";
    public string OpeningHours { get; set; } = "";
}
