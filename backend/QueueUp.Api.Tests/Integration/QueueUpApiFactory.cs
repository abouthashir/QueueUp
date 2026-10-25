using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using QueueUp.Api.Background;
using QueueUp.Api.Data;

namespace QueueUp.Api.Tests.Integration;

public class QueueUpApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private const string DefaultServer = @"Server=(localdb)\MSSQLLocalDB;Trusted_Connection=True;TrustServerCertificate=True";

    private readonly string _connectionString;

    public QueueUpApiFactory()
    {
        var connection = new SqlConnectionStringBuilder(
            Environment.GetEnvironmentVariable("QUEUEUP_TEST_SQL") ?? DefaultServer)
        {
            InitialCatalog = $"QueueUpTests_{Guid.NewGuid():N}"
        };
        _connectionString = connection.ConnectionString;
    }

    protected virtual int AuthAttemptsPerFiveMinutes => 1000;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:QueueUp", _connectionString);
        builder.UseSetting("Jwt:SigningKey", "integration-test-signing-key-0123456789");
        builder.UseSetting("RateLimits:AuthAttemptsPerFiveMinutes", AuthAttemptsPerFiveMinutes.ToString());
        builder.UseSetting("RateLimits:JoinsPerMinute", "1000");

        builder.ConfigureServices(services =>
        {
            ServiceDescriptor cleanup = services.Single(service => service.ImplementationType == typeof(PrivacyCleanupService));
            services.Remove(cleanup);
        });
    }

    public async Task InitializeAsync()
    {
        using IServiceScope scope = Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<QueueUpDbContext>().Database.MigrateAsync();
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        using (IServiceScope scope = Services.CreateScope())
        {
            await scope.ServiceProvider.GetRequiredService<QueueUpDbContext>().Database.EnsureDeletedAsync();
        }

        await base.DisposeAsync();
    }
}
