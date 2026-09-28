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

// Lesson 2: returns a sample token so we can see its JSON shape
app.MapGet("/api/tokens/demo", () =>
{
    var token = new Token
    {
        Id = Guid.NewGuid(),
        Prefix = 'A',
        Number = 14,
        Status = TokenStatus.Waiting,
        CustomerName = "Anu",
        CreatedAt = DateTimeOffset.UtcNow
    };

    return token;
});

app.Run();
