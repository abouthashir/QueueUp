namespace QueueUp.Api.Contracts;

public record UpdateStaffRequest(string Name, string CounterName)
{
    public string? FindProblem()
    {
        if (string.IsNullOrWhiteSpace(Name) || Name.Trim().Length > 100)
        {
            return "Enter a name (up to 100 characters).";
        }

        if (string.IsNullOrWhiteSpace(CounterName) || CounterName.Trim().Length > 50)
        {
            return "Enter a counter name (up to 50 characters).";
        }

        return null;
    }
}
