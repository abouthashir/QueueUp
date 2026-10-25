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


    [Fact]
    public async Task AnotherBusiness_CannotSeeOrTouchTheQueue()
    {
        HttpClient sunrise = await ApiHelpers.SignUpOwnerAsync(_factory, "Sunrise Clinic");
        HttpClient cityBank = await ApiHelpers.SignUpOwnerAsync(_factory, "City Bank");
        Guid queueId = await ApiHelpers.CreateOpenQueueAsync(sunrise);
        TokenResponse anu = await ApiHelpers.JoinAsync(_factory.CreateClient(), queueId, "Anu");

        var bankQueues = await cityBank.GetFromJsonAsync<List<QueueOverviewResponse>>("/api/queues", ApiHelpers.Json);
        HttpResponseMessage dashboard = await cityBank.GetAsync($"/api/queues/{queueId}/dashboard");
        HttpResponseMessage callNext = await cityBank.PostAsync($"/api/queues/{queueId}/call-next", null);
        HttpResponseMessage serve = await cityBank.PostAsync($"/api/tokens/{anu.Id}/serve", null);

        Assert.Empty(bankQueues!);
        Assert.Equal(HttpStatusCode.NotFound, dashboard.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, callNext.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, serve.StatusCode);
    }

    [Fact]
    public async Task RemovedStaff_AreLockedOutAtOnce()
    {
        HttpClient owner = await ApiHelpers.SignUpOwnerAsync(_factory, "Sunrise Clinic");
        HttpClient staff = await ApiHelpers.AddStaffAsync(_factory, owner, "Counter 2");
        var staffList = await owner.GetFromJsonAsync<List<StaffResponse>>("/api/staff", ApiHelpers.Json);

        HttpResponseMessage before = await staff.GetAsync("/api/queues");
        await owner.DeleteAsync($"/api/staff/{staffList!.Single().Id}");
        HttpResponseMessage after = await staff.GetAsync("/api/queues");

        Assert.Equal(HttpStatusCode.OK, before.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, after.StatusCode);
    }

    [Fact]
    public async Task CustomerNamesOlderThanThirtyDays_AreForgotten()
    {
        HttpClient owner = await ApiHelpers.SignUpOwnerAsync(_factory, "Sunrise Clinic");
        Guid queueId = await ApiHelpers.CreateOpenQueueAsync(owner);
        DateOnly today = ServiceDay.For(DateTimeOffset.UtcNow);

        using IServiceScope scope = _factory.Services.CreateScope();
        QueueUpDbContext db = scope.ServiceProvider.GetRequiredService<QueueUpDbContext>();
        var old = new Token { Id = Guid.NewGuid(), QueueId = queueId, Prefix = 'A', Number = 1, CustomerName = "Old visit", ServiceDate = today.AddDays(-31) };
        var recent = new Token { Id = Guid.NewGuid(), QueueId = queueId, Prefix = 'A', Number = 1, CustomerName = "Recent visit", ServiceDate = today.AddDays(-29) };
        db.Tokens.AddRange(old, recent);
        await db.SaveChangesAsync();

        int forgotten = await new QueueStore(db).ForgetCustomerNamesBeforeAsync(today.AddDays(-30), CancellationToken.None);

        Assert.Equal(1, forgotten);
        Assert.Null(await db.Tokens.Where(token => token.Id == old.Id).Select(token => token.CustomerName).SingleAsync());
        Assert.Equal("Recent visit", await db.Tokens.Where(token => token.Id == recent.Id).Select(token => token.CustomerName).SingleAsync());
    }


    [Fact]
    public async Task TwoCountersCallingAtTheSameMoment_NeverGetTheSameToken()
    {
        HttpClient owner = await ApiHelpers.SignUpOwnerAsync(_factory, "Sunrise Clinic", "Counter 1");
        HttpClient staff = await ApiHelpers.AddStaffAsync(_factory, owner, "Counter 2");
        Guid queueId = await ApiHelpers.CreateOpenQueueAsync(owner);
        HttpClient customer = _factory.CreateClient();
        for (int i = 0; i < 10; i++)
        {
            await ApiHelpers.JoinAsync(customer, queueId, null);
        }

        for (int round = 0; round < 5; round++)
        {
            HttpResponseMessage[] calls = await Task.WhenAll(
                owner.PostAsync($"/api/queues/{queueId}/call-next", null),
                staff.PostAsync($"/api/queues/{queueId}/call-next", null));

            TokenResponse first = await calls[0].ReadAsync<TokenResponse>();
            TokenResponse second = await calls[1].ReadAsync<TokenResponse>();
            Assert.NotEqual(first.Id, second.Id);

            await owner.PostAsync($"/api/tokens/{first.Id}/serve", null);
            await staff.PostAsync($"/api/tokens/{second.Id}/serve", null);
        }
    }

    [Fact]
    public async Task ManyPeopleJoiningAtOnce_GetUniqueNumbers()
    {
        HttpClient owner = await ApiHelpers.SignUpOwnerAsync(_factory, "Sunrise Clinic");
        Guid queueId = await ApiHelpers.CreateOpenQueueAsync(owner);
        HttpClient customer = _factory.CreateClient();

        TokenResponse[] tokens = await Task.WhenAll(
            Enumerable.Range(1, 8).Select(_ => ApiHelpers.JoinAsync(customer, queueId, null)));

        Assert.Equal(
            Enumerable.Range(1, 8).Select(number => $"A-{number:D3}"),
            tokens.Select(token => token.DisplayNumber).Order());
    }
}
