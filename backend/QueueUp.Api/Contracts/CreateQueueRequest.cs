namespace QueueUp.Api.Contracts;

public record CreateQueueRequest(string Name, char Prefix, int AverageServiceMinutes)
{
    public string? FindProblem()
    {
        if (string.IsNullOrWhiteSpace(Name) || Name.Trim().Length > 100)
        {
            return "Enter a queue name (up to 100 characters).";
        }

        if (!char.IsAsciiLetter(Prefix))
        {
            return "The token prefix must be a single letter, such as A.";
        }

        if (AverageServiceMinutes < 1 || AverageServiceMinutes > 120)
        {
            return "The average service time must be between 1 and 120 minutes.";
        }

        return null;
    }
}
