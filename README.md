# QueueUp

Digital queue tokens for small businesses such as clinics, banks and salons. Customers scan a QR code, get a
token in their browser (no app, no sign-up) and watch their place live. Staff call the next person with one
click, and a TV board shows who is being served.

## What's inside

| Folder | What it is |
|---|---|
| `backend/QueueUp.Api` | ASP.NET Core (.NET 10) minimal API, EF Core with SQL Server, SignalR, JWT logins |
| `backend/QueueUp.Api.Tests` | xUnit unit tests and integration tests against a real SQL Server |
| `frontend` | React + TypeScript (Vite), React Router, SignalR client, Vitest |

## Run it locally

You need the .NET 10 SDK, Node.js and SQL Server LocalDB.

```bash
dotnet user-secrets set "Jwt:SigningKey" "<at least 32 random characters>" --project backend/QueueUp.Api
dotnet ef database update --project backend/QueueUp.Api
dotnet run --project backend/QueueUp.Api
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and create an account.

## Tests

```bash
dotnet test
cd frontend && npm test
```

The integration tests create and delete their own database. They use LocalDB unless the `QUEUEUP_TEST_SQL`
environment variable names another SQL Server.

## Configuration

See `.env.example` for every setting the app needs in production. Real values live in the hosting platform's
secret store, never in this repository.
