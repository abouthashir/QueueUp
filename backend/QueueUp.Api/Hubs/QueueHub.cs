using Microsoft.AspNetCore.SignalR;

namespace QueueUp.Api.Hubs;

public class QueueHub : Hub
{
    public static string GroupFor(Guid queueId) => $"queue-{queueId}";

    // A reconnected browser gets a new connection id, so it must call this again.
    public async Task WatchQueue(Guid queueId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupFor(queueId));
    }
}
