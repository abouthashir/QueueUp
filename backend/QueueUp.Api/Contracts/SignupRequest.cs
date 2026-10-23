namespace QueueUp.Api.Contracts;

public record SignupRequest(string BusinessName, string Name, string Email, string Password, string CounterName)
{
    public const int MinimumPasswordLength = 8;

    public string? FindProblem()
    {
        if (string.IsNullOrWhiteSpace(BusinessName) || BusinessName.Trim().Length > 100)
        {
            return "Enter your business name (up to 100 characters).";
        }

        if (string.IsNullOrWhiteSpace(Name) || Name.Trim().Length > 100)
        {
            return "Enter your name (up to 100 characters).";
        }

        if (string.IsNullOrWhiteSpace(Email) || !Email.Contains('@') || Email.Trim().Length > 200)
        {
            return "Enter a valid email address.";
        }

        if (string.IsNullOrEmpty(Password) || Password.Length < MinimumPasswordLength)
        {
            return $"Choose a password with at least {MinimumPasswordLength} characters.";
        }

        if (string.IsNullOrWhiteSpace(CounterName) || CounterName.Trim().Length > 50)
        {
            return "Enter your counter name (up to 50 characters).";
        }

        return null;
    }
}
