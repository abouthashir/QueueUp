using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class WaitTimeEstimatorTests
{
    [Fact]
    public void EstimateMinutes_PrdExample_Returns45()
    {
        int result = WaitTimeEstimator.EstimateMinutes(9, 5, 1);

        Assert.Equal(45, result);
    }

    [Theory]
    [InlineData(9, 5, 2, 23)]
    [InlineData(10, 5, 2, 25)]
    [InlineData(0, 5, 1, 0)]
    [InlineData(3, 5, 0, 15)]
    public void EstimateMinutes_ReturnsExpectedMinutes(int peopleAhead, int averageServiceMinutes, int activeCounters, int expected)
    {
        int result = WaitTimeEstimator.EstimateMinutes(peopleAhead, averageServiceMinutes, activeCounters);

        Assert.Equal(expected, result);
    }
}
