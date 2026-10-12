using System.Text.Json.Serialization;
using QueueUp.Api.Contracts;
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

app.MapPost("/api/queues/{queueId:guid}/tokens", (Guid queueId, JoinQueueRequest request, QueueStore store) =>
{
    Queue? queue = store.FindQueue(queueId);

    if (queue == null)
    {
        return Results.NotFound(new { message = $"Queue {queueId} was not found." });
    }

    try
    {
        Token token = queue.Join(request.CustomerName);
        return Results.Created($"/api/tokens/{token.Id}", TokenResponse.From(queue, token));
    }
    catch (InvalidOperationException exception)
    {
        return Results.Conflict(new { message = exception.Message });
    }
});

app.MapGet("/api/tokens/{tokenId:guid}", (Guid tokenId, QueueStore store) =>
{
    Token? token = store.FindToken(tokenId);

    if (token == null)
    {
        return Results.NotFound(new { message = $"Token {tokenId} was not found." });
    }

    Queue? queue = store.FindQueue(token.QueueId);

    if (queue == null)
    {
        return Results.NotFound(new { message = $"Queue {token.QueueId} was not found." });
    }

    return Results.Ok(TokenResponse.From(queue, token));
});

app.MapPost("/api/queues/{queueId:guid}/pause", (Guid queueId, QueueStore store) =>
{
    Queue? queue = store.FindQueue(queueId);

    if (queue == null)
    {
        return Results.NotFound(new { message = $"Queue {queueId} was not found." });
    }

    queue.Pause();
    return Results.Ok(queue);
});

app.MapPost("/api/queues/{queueId:guid}/open", (Guid queueId, QueueStore store) =>
{
    Queue? queue = store.FindQueue(queueId);

    if (queue == null)
    {
        return Results.NotFound(new { message = $"Queue {queueId} was not found." });
    }

    queue.Open();
    return Results.Ok(queue);
});

app.Run();
