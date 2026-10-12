using System.Text.Json.Serialization;
using QueueUp.Api.Data;
using QueueUp.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddSingleton<QueueStore>();

var app = builder.Build();

app.MapGet("/", () => "QueueUp API is running");

app.MapGet("/api/health", () => new { status = "ok", service = "QueueUp API" });

app.MapQueueEndpoints();
app.MapTokenEndpoints();

app.Run();
