namespace QueueUp.Api.Domain;

public static class PrivacyRules
{
    public const int KeepCustomerNamesForDays = 30;

    public static DateOnly ForgetNamesBefore(DateTimeOffset now)
    {
        return ServiceDay.For(now).AddDays(-KeepCustomerNamesForDays);
    }
}
