using Microsoft.EntityFrameworkCore;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Data;

public class QueueUpDbContext : DbContext
{
    public QueueUpDbContext(DbContextOptions<QueueUpDbContext> options)
        : base(options)
    {
    }

    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Queue> Queues => Set<Queue>();
    public DbSet<Token> Tokens => Set<Token>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Business>(business =>
        {
            business.Property(b => b.Id).ValueGeneratedNever();
            business.Property(b => b.Name).HasMaxLength(100);

            business.HasData(new Business { Id = QueueStore.DemoBusinessId, Name = "Demo Clinic" });
        });

        modelBuilder.Entity<User>(user =>
        {
            user.Property(u => u.Id).ValueGeneratedNever();
            user.Property(u => u.Name).HasMaxLength(100);
            user.Property(u => u.Email).HasMaxLength(200);
            user.Property(u => u.PasswordHash).HasMaxLength(200);
            user.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
            user.Property(u => u.CounterName).HasMaxLength(50);

            user.HasIndex(u => u.Email).IsUnique();
            user.HasOne<Business>().WithMany().HasForeignKey(u => u.BusinessId);
        });

        modelBuilder.Entity<Queue>(queue =>
        {
            queue.Property(q => q.Id).ValueGeneratedNever();
            queue.Property(q => q.Name).HasMaxLength(100);
            queue.Property(q => q.Status).HasConversion<string>().HasMaxLength(20);

            queue.HasOne<Business>().WithMany().HasForeignKey(q => q.BusinessId);

            queue.HasMany<Token>("_tokens")
                .WithOne()
                .HasForeignKey(token => token.QueueId);

            queue.HasData(new
            {
                Id = QueueStore.DemoQueueId,
                BusinessId = QueueStore.DemoBusinessId,
                Name = "General OPD",
                Prefix = 'A',
                AverageServiceMinutes = 5,
                Status = QueueStatus.Open
            });
        });

        modelBuilder.Entity<Token>(token =>
        {
            token.Property(t => t.Id).ValueGeneratedNever();
            token.Property(t => t.Status).IsConcurrencyToken();
            token.Property(t => t.Status).HasConversion<string>().HasMaxLength(20);
            token.Property(t => t.CustomerName).HasMaxLength(100);
            token.Property(t => t.CounterName).HasMaxLength(50);

            token.HasIndex(t => new { t.QueueId, t.ServiceDate, t.Number }).IsUnique();
        });
    }
}
