using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
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

    public async Task<List<Queue>> GetAllAsync()
    {
        return await _db.Queues.ToListAsync();
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
        catch (DbUpdateException exception) when (exception.InnerException is SqlException { Number: 2601 or 2627 })
        {
            _db.ChangeTracker.Clear();
            return false;
        }
    }
}
