using System.Text.Json.Serialization;
using QueueUp.Api.Data;
using QueueUp.Api.Domain;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddSingleton<QueueStore>();

var app = builder.Build();

app.MapGet("/", () => "QueueUp API is running");

app.MapGet("/api/health", () => new { status = "ok", service = "QueueUp API" });

app.MapGet("/api/queues", (QueueStore store) =>
{
    return store.GetAll();
});

app.MapGet("/api/queues/{queueId:guid}", (Guid queueId, QueueStore store) =>
{
    Queue? queue = store.FindQueue(queueId);

    if (queue == null)
    {
        return Results.NotFound(new { message = $"Queue {queueId} was not found." });
    }

    return Results.Ok(queue);
});

// Sample token for checking the JSON shape; replaced by real endpoints in the queue logic
app.MapGet("/api/tokens/demo", () =>
{
    var token = new Token
    {
        Id = Guid.NewGuid(),
        Prefix = 'A',
        Number = 14,
        CustomerName = "Anu",
        CreatedAt = DateTimeOffset.UtcNow
    };

    return token;
});

app.Run();
