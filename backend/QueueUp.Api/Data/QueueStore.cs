using Microsoft.EntityFrameworkCore;
using Npgsql;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Data;

public class QueueStore
{
    public static readonly Guid DemoQueueId = Guid.Parse("c250ddb5-277c-4dd9-b1d6-e3b230bb69ac");
    public static readonly Guid DemoBusinessId = Guid.Parse("5e0b6a3c-8d2f-4c71-9a4e-0f3d2b1c7e65");

    private readonly QueueUpDbContext _db;

    public QueueStore(QueueUpDbContext db)
    {
        _db = db;
    }

    public async Task<List<Queue>> GetQueuesForBusinessAsync(Guid businessId)
    {
        return await _db.Queues
            .Include("_tokens")
            .Where(queue => queue.BusinessId == businessId)
            .OrderBy(queue => queue.Name)
            .ToListAsync();
    }

    public async Task<Queue?> FindQueueForBusinessAsync(Guid queueId, Guid businessId)
    {
        return await _db.Queues
            .Include("_tokens")
            .FirstOrDefaultAsync(queue => queue.Id == queueId && queue.BusinessId == businessId);
    }

    public async Task<Queue?> FindQueueAsync(Guid queueId)
    {
        return await _db.Queues
            .Include("_tokens")
            .FirstOrDefaultAsync(queue => queue.Id == queueId);
    }

    public async Task<Token?> FindTokenAsync(Guid tokenId)
    {
        return await _db.Tokens.FirstOrDefaultAsync(token => token.Id == tokenId);
    }

    public async Task<User?> FindUserByEmailAsync(string email)
    {
        return await _db.Users.FirstOrDefaultAsync(user => user.Email == email);
    }

    public async Task<bool> UserExistsAsync(Guid userId)
    {
        return await _db.Users.AnyAsync(user => user.Id == userId);
    }

    public async Task<List<User>> GetStaffAsync(Guid businessId)
    {
        return await _db.Users
            .Where(user => user.BusinessId == businessId && user.Role == UserRole.Staff)
            .OrderBy(user => user.Name)
            .ToListAsync();
    }

    public async Task<User?> FindStaffAsync(Guid userId, Guid businessId)
    {
        return await _db.Users.FirstOrDefaultAsync(user =>
            user.Id == userId && user.BusinessId == businessId && user.Role == UserRole.Staff);
    }

    public void RemoveUser(User user)
    {
        _db.Users.Remove(user);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _db.Users.AnyAsync(user => user.Email == email);
    }

    public async Task<Business?> FindBusinessAsync(Guid businessId)
    {
        return await _db.Businesses.FirstOrDefaultAsync(business => business.Id == businessId);
    }

    public void AddBusiness(Business business)
    {
        _db.Businesses.Add(business);
    }

    public void AddUser(User user)
    {
        _db.Users.Add(user);
    }

    public void AddQueue(Queue queue)
    {
        _db.Queues.Add(queue);
    }

    public async Task<int> ForgetCustomerNamesBeforeAsync(DateOnly cutoff, CancellationToken cancellationToken)
    {
        return await _db.Tokens
            .Where(token => token.ServiceDate < cutoff && token.CustomerName != null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(token => token.CustomerName, (string?)null), cancellationToken);
    }

    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }

    public async Task<bool> TrySaveChangesAsync()
    {
        try
        {
            await _db.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            _db.ChangeTracker.Clear();
            return false;
        }
        catch (DbUpdateException exception) when (exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            _db.ChangeTracker.Clear();
            return false;
        }
    }
}
