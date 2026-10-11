using QueueUp.Api.Domain;

namespace QueueUp.Api.Data;

public class QueueStore
{
    public static readonly Guid DemoQueueId = Guid.Parse("c250ddb5-277c-4dd9-b1d6-e3b230bb69ac");

    private readonly List<Queue> _queues = new();

    public QueueStore()
    {
        var demoQueue = new Queue
        {
            Id = DemoQueueId,
            Name = "General OPD",
            Prefix = 'A',
            AverageServiceMinutes = 5
        };

        demoQueue.Open();
        _queues.Add(demoQueue);
    }

    public IReadOnlyList<Queue> GetAll()
    {
        return _queues;
    }

    public Queue? FindQueue(Guid queueId)
    {
        return _queues.FirstOrDefault(queue => queue.Id == queueId);
    }

    public Token? FindToken(Guid tokenId)
    {
        foreach (Queue queue in _queues)
        {
            Token? token = queue.FindToken(tokenId);

            if (token != null)
            {
                return token;
            }
        }

        return null;
    }
}
