using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using QueueUp.Api.Data;
using QueueUp.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

string connectionString = builder.Configuration.GetConnectionString("QueueUp")
    ?? throw new InvalidOperationException("Connection string 'QueueUp' is missing.");

builder.Services.AddDbContext<QueueUpDbContext>(options =>
    options.UseSqlServer(connectionString));


builder.Services.AddSingleton<QueueStore>();

var app = builder.Build();

app.MapGet("/", () => "QueueUp API is running");

app.MapGet("/api/health", () => new { status = "ok", service = "QueueUp API" });

app.MapQueueEndpoints();
app.MapTokenEndpoints();

app.Run();
