using QueueUp.Api.Data;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Background;

public class PrivacyCleanupService : BackgroundService
{
    private static readonly TimeSpan RunEvery = TimeSpan.FromHours(6);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeProvider _clock;
    private readonly ILogger<PrivacyCleanupService> _logger;

    public PrivacyCleanupService(IServiceScopeFactory scopeFactory, TimeProvider clock, ILogger<PrivacyCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _clock = clock;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(RunEvery, _clock);

        do
        {
            try
            {
                await ForgetOldCustomerNamesAsync(stoppingToken);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                _logger.LogError(exception, "Forgetting old customer names failed. Trying again later.");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task ForgetOldCustomerNamesAsync(CancellationToken cancellationToken)
    {
        using IServiceScope scope = _scopeFactory.CreateScope();
        QueueStore store = scope.ServiceProvider.GetRequiredService<QueueStore>();

        DateOnly cutoff = PrivacyRules.ForgetNamesBefore(_clock.GetUtcNow());
        int forgotten = await store.ForgetCustomerNamesBeforeAsync(cutoff, cancellationToken);

        if (forgotten > 0)
        {
            _logger.LogInformation("Forgot {Count} customer names from visits before {Cutoff}.", forgotten, cutoff);
        }
    }
}
