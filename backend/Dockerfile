# Build stage: the full .NET SDK compiles and publishes the API.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY QueueUp.Api/QueueUp.Api.csproj QueueUp.Api/
RUN dotnet restore QueueUp.Api/QueueUp.Api.csproj

COPY QueueUp.Api/ QueueUp.Api/
RUN dotnet publish QueueUp.Api/QueueUp.Api.csproj --configuration Release --output /app --no-restore

# Run stage: only the small ASP.NET Core runtime and the published files.
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .

USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "QueueUp.Api.dll"]
