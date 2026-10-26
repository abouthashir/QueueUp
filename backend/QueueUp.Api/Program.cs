using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QueueUp.Api.Auth;
using QueueUp.Api.Data;
using QueueUp.Api.Domain;
using QueueUp.Api.Endpoints;
using QueueUp.Api.Hubs;
using System.Security.Claims;
using QueueUp.Api.Background;
using System.Threading.RateLimiting;
using QueueUp.Api.Security;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

string connectionString = builder.Configuration.GetConnectionString("QueueUp")
    ?? throw new InvalidOperationException("Connection string 'QueueUp' is missing.");

builder.Services.AddDbContext<QueueUpDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql => npgsql.EnableRetryOnFailure()));

builder.Services.AddScoped<QueueStore>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSignalR();
builder.Services.AddSingleton<QueueNotifier>();
builder.Services.AddHostedService<PrivacyCleanupService>();

JwtOptions jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("The 'Jwt' settings are missing.");

if (jwt.SigningKey.Length < 32)
{
    throw new InvalidOperationException("'Jwt:SigningKey' must be at least 32 characters. Set it with dotnet user-secrets.");
}

builder.Services.AddSingleton(jwt);
builder.Services.AddSingleton<TokenIssuer>();
builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = jwt.CreateSigningKey(),
            NameClaimType = AuthClaims.Name,
            RoleClaimType = AuthClaims.Role
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                QueueStore store = context.HttpContext.RequestServices.GetRequiredService<QueueStore>();
                string? userId = context.Principal?.FindFirstValue(AuthClaims.UserId);

                if (!Guid.TryParse(userId, out Guid id) || !await store.UserExistsAsync(id))
                {
                    context.Fail("This account no longer exists.");
                }
            }
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy(AuthPolicies.OwnerOnly, policy => policy.RequireRole(nameof(UserRole.Owner)));

RateLimitOptions limits = builder.Configuration.GetSection(RateLimitOptions.SectionName).Get<RateLimitOptions>()
    ?? new RateLimitOptions();

builder.Services.AddRateLimiter(options =>
{
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { message = "Too many attempts. Please wait a few minutes and try again." }, cancellationToken);
    };

    options.AddPolicy(RateLimitOptions.AuthPolicy, context => RateLimitPartition.GetFixedWindowLimiter(
        RateLimitOptions.ClientKey(context),
        _ => new FixedWindowRateLimiterOptions { PermitLimit = limits.AuthAttemptsPerFiveMinutes, Window = TimeSpan.FromMinutes(5) }));

    options.AddPolicy(RateLimitOptions.JoinPolicy, context => RateLimitPartition.GetFixedWindowLimiter(
        RateLimitOptions.ClientKey(context),
        _ => new FixedWindowRateLimiterOptions { PermitLimit = limits.JoinsPerMinute, Window = TimeSpan.FromMinutes(1) }));
});

string[] allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials());
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

if (app.Configuration.GetValue<bool>("Database:MigrateOnStartup"))
{
    using IServiceScope scope = app.Services.CreateScope();
    await scope.ServiceProvider.GetRequiredService<QueueUpDbContext>().Database.MigrateAsync();
}

app.UseForwardedHeaders();

app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
{
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    await context.Response.WriteAsJsonAsync(new { message = "Something went wrong on our side. Please try again." });
}));

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapGet("/", () => "QueueUp API is running");

app.MapGet("/api/health", () => new { status = "ok", service = "QueueUp API" });

app.MapAuthEndpoints();
app.MapBusinessEndpoints();
app.MapQueueEndpoints();
app.MapStaffEndpoints();
app.MapTokenEndpoints();
app.MapHub<QueueHub>("/hubs/queue");

app.Run();


public partial class Program;
