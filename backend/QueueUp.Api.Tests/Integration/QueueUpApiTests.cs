using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using QueueUp.Api.Contracts;
using QueueUp.Api.Data;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Tests.Integration;

public class QueueUpApiTests : IClassFixture<QueueUpApiFactory>
{
    private readonly QueueUpApiFactory _factory;

    public QueueUpApiTests(QueueUpApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task OwnerSignsUp_CustomerJoins_CounterServesThem()
    {
        HttpClient owner = await ApiHelpers.SignUpOwnerAsync(_factory, "Sunrise Clinic");
        Guid queueId = await ApiHelpers.CreateOpenQueueAsync(owner);
        HttpClient customer = _factory.CreateClient();

        TokenResponse anu = await ApiHelpers.JoinAsync(customer, queueId, "Anu");
        HttpResponseMessage called = await owner.PostAsync($"/api/queues/{queueId}/call-next", null);
        HttpResponseMessage served = await owner.PostAsync($"/api/tokens/{anu.Id}/serve", null);

        Assert.Equal(HttpStatusCode.OK, called.StatusCode);
        Assert.Equal("Counter 1", (await called.ReadAsync<TokenResponse>()).CounterName);
        Assert.Equal(TokenStatus.Served, (await served.ReadAsync<TokenResponse>()).Status);

        var queues = await owner.GetFromJsonAsync<List<QueueOverviewResponse>>("/api/queues", ApiHelpers.Json);
        Assert.Equal(1, queues!.Single().ServedToday);
    }
}
