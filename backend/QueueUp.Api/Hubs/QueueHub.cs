using Microsoft.AspNetCore.SignalR;

namespace QueueUp.Api.Hubs;

public class QueueHub : Hub
{
    public static string GroupFor(Guid queueId) => $"queue-{queueId}";

    public async Task WatchQueue(Guid queueId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupFor(queueId));
    }
}
