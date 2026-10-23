namespace QueueUp.Api.Contracts;

public record CreateStaffRequest(string Name, string Email, string Password, string CounterName)
{
    public string? FindProblem()
    {
        return new SignupRequest("-", Name, Email, Password, CounterName).FindProblem();
    }
}
