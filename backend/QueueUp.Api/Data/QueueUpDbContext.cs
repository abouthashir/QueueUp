using Microsoft.EntityFrameworkCore;
using QueueUp.Api.Domain;

namespace QueueUp.Api.Data;

public class QueueUpDbContext : DbContext
{
    public QueueUpDbContext(DbContextOptions<QueueUpDbContext> options)
        : base(options)
    {
    }

    public DbSet<Queue> Queues => Set<Queue>();
    public DbSet<Token> Tokens => Set<Token>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Queue>(queue =>
        {
            queue.Property(q => q.Name).HasMaxLength(100);
            queue.Property(q => q.Status).HasConversion<string>().HasMaxLength(20);

            queue.HasMany<Token>("_tokens")
                .WithOne()
                .HasForeignKey(token => token.QueueId);

            queue.HasData(new
            {
                Id = QueueStore.DemoQueueId,
                Name = "General OPD",
                Prefix = 'A',
                AverageServiceMinutes = 5,
                Status = QueueStatus.Open
            });
        });

        modelBuilder.Entity<Token>(token =>
        {
            token.Property(t => t.Id).ValueGeneratedNever();
            token.Property(t => t.Status).HasConversion<string>().HasMaxLength(20);
            token.Property(t => t.CustomerName).HasMaxLength(100);
            token.Property(t => t.CounterName).HasMaxLength(50);
        });
    }
}
