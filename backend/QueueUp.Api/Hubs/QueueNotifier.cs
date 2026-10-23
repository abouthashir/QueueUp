using Microsoft.AspNetCore.SignalR;

namespace QueueUp.Api.Hubs;

public class QueueNotifier
{
    private readonly IHubContext<QueueHub> _hub;

    public QueueNotifier(IHubContext<QueueHub> hub)
    {
        _hub = hub;
    }

    public async Task QueueChangedAsync(Guid queueId)
    {
        await _hub.Clients.Group(QueueHub.GroupFor(queueId)).SendAsync("QueueChanged", queueId);
    }
}
