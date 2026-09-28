using System.Text.Json.Serialization;
using QueueUp.Api.Domain;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var app = builder.Build();

app.MapGet("/", () => "QueueUp API is running");

app.MapGet("/api/health", () => new { status = "ok", service = "QueueUp API" });

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
