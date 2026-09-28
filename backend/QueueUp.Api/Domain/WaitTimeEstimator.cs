namespace QueueUp.Api.Domain;

public static class WaitTimeEstimator
{
    public static int EstimateMinutes(int peopleAhead, int averageServiceMinutes, int activeCounters)
    {
        if (peopleAhead <= 0)
        {
            return 0;
        }

        int counters;
        if (activeCounters < 1)
        {
            counters = 1;
        }
        else
        {
            counters = activeCounters;
        }

        double exactMinutes = (double)(peopleAhead * averageServiceMinutes) / counters;
        return (int)Math.Ceiling(exactMinutes);
    }
}
