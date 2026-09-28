var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "QueueUp API is running");

app.MapGet("/api/health", () => new { status = "ok", service = "QueueUp API" });

app.Run();
