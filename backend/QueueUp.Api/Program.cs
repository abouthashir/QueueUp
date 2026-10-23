using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using QueueUp.Api.Data;
using QueueUp.Api.Endpoints;
using QueueUp.Api.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

string connectionString = builder.Configuration.GetConnectionString("QueueUp")
    ?? throw new InvalidOperationException("Connection string 'QueueUp' is missing.");

builder.Services.AddDbContext<QueueUpDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddScoped<QueueStore>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSignalR();
builder.Services.AddSingleton<QueueNotifier>();

string[] allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
                policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials());
});

var app = builder.Build();

app.UseCors();

app.MapGet("/", () => "QueueUp API is running");

app.MapGet("/api/health", () => new { status = "ok", service = "QueueUp API" });

app.MapQueueEndpoints();
app.MapTokenEndpoints();
app.MapHub<QueueHub>("/hubs/queue");

app.Run();
