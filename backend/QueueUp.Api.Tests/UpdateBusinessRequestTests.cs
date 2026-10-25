using QueueUp.Api.Contracts;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests;

public class UpdateBusinessRequestTests
{
    [Fact]
    public void FindProblem_ValidRequest_ReturnsNull()
    {
        var request = new UpdateBusinessRequest("Sunrise Clinic", BusinessType.Clinic, "Main Road, Kalpetta", "9 am to 5 pm");

        Assert.Null(request.FindProblem());
    }

    [Fact]
    public void FindProblem_MissingAddressAndHours_IsAllowed()
    {
        var request = new UpdateBusinessRequest("Sunrise Clinic", BusinessType.Clinic, null, null);

        Assert.Null(request.FindProblem());
    }

    [Fact]
    public void FindProblem_UnknownBusinessType_IsRejected()
    {
        var request = new UpdateBusinessRequest("Sunrise Clinic", (BusinessType)99, null, null);

        Assert.Equal("Choose a business type: Clinic, Bank, Salon or Other.", request.FindProblem());
    }
}
