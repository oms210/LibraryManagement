using Lending.Api.Data;
using Lending.Api.Models;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace Lending.Api.BackgroundServices
{
    public class OverdueCheckerService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IConnectionMultiplexer _redis;

        public OverdueCheckerService(IServiceScopeFactory scopeFactory, IConnectionMultiplexer redis)
        {
            _scopeFactory = scopeFactory;
            _redis = redis;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var pub = _redis.GetSubscriber();

            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var overdueLoans = await db.Loans
                    .Include(l => l.Book)
                    .Include(l => l.Member)
                    .Where(l => l.DueDate < DateTime.UtcNow && !l.Returned)
                    .ToListAsync(stoppingToken);

                foreach (var loan in overdueLoans)
                {
                    var message = $"{loan.Member.FirstName} {loan.Member.LastName} has overdue book: {loan.Book.Title}";
                    await pub.PublishAsync("overdue_notifications", message);
                }

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }
    }
}
