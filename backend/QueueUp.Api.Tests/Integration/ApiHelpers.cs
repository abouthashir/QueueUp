using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using QueueUp.Api.Contracts;

namespace QueueUp.Api.Tests.Integration;

public static class ApiHelpers
{
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public static async Task<T> ReadAsync<T>(this HttpResponseMessage response)
    {
        T? body = await response.Content.ReadFromJsonAsync<T>(Json);
        return body ?? throw new InvalidOperationException($"The response had no {typeof(T).Name}.");
    }

    public static void UsePass(this HttpClient client, string token)
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    public static async Task<HttpClient> SignUpOwnerAsync(QueueUpApiFactory factory, string businessName, string counterName = "Counter 1")
    {
        HttpClient client = factory.CreateClient();
        string email = $"{Guid.NewGuid():N}@owner.test";

        HttpResponseMessage response = await client.PostAsJsonAsync("/api/auth/signup",
            new SignupRequest(businessName, "Owner", email, "test-password-1", counterName));
        response.EnsureSuccessStatusCode();

        client.UsePass((await response.ReadAsync<AuthResponse>()).Token);
        return client;
    }

    public static async Task<HttpClient> AddStaffAsync(QueueUpApiFactory factory, HttpClient owner, string counterName)
    {
        string email = $"{Guid.NewGuid():N}@staff.test";

        HttpResponseMessage created = await owner.PostAsJsonAsync("/api/staff",
            new CreateStaffRequest("Staff", email, "test-password-2", counterName));
        created.EnsureSuccessStatusCode();

        HttpClient staff = factory.CreateClient();
        HttpResponseMessage login = await staff.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "test-password-2"));
        login.EnsureSuccessStatusCode();

        staff.UsePass((await login.ReadAsync<AuthResponse>()).Token);
        return staff;
    }

    public static async Task<Guid> CreateOpenQueueAsync(HttpClient owner, string name = "General OPD")
    {
        HttpResponseMessage created = await owner.PostAsJsonAsync("/api/queues", new CreateQueueRequest(name, 'A', 5));
        created.EnsureSuccessStatusCode();
        Guid queueId = (await created.ReadAsync<QueueOverviewResponse>()).Id;

        (await owner.PostAsync($"/api/queues/{queueId}/open", null)).EnsureSuccessStatusCode();
        return queueId;
    }

    public static async Task<TokenResponse> JoinAsync(HttpClient client, Guid queueId, string? customerName)
    {
        HttpResponseMessage response = await client.PostAsJsonAsync($"/api/queues/{queueId}/tokens", new JoinQueueRequest(customerName));
        response.EnsureSuccessStatusCode();
        return await response.ReadAsync<TokenResponse>();
    }
}
