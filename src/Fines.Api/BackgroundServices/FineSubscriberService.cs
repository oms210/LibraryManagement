using Fines.Api.Data;
using Fines.Api.Models;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;

namespace Fines.Api.BackgroundServices
{
    public class FineSubscriberService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ISubscriber _subscriber;

        public FineSubscriberService(IServiceScopeFactory scopeFactory, IConnectionMultiplexer redis)
        {
            _scopeFactory = scopeFactory;
            _subscriber = redis.GetSubscriber();
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _subscriber.Subscribe("fines", async (channel, message) =>
            {
                var data = JsonSerializer.Deserialize<Dictionary<string, object>>(message!);
                if (data == null) return;

                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<FinesDbContext>();

                int memberId = Convert.ToInt32(data["MemberId"]);
                int bookId = Convert.ToInt32(data["BookId"]);

                var fine = await db.Fines.FirstOrDefaultAsync(f =>
                    f.MemberId == memberId && f.BookId == bookId && !f.Collected);

                if (fine == null)
                {
                    fine = new Fine { MemberId = memberId, BookId = bookId };
                    db.Fines.Add(fine);
                }

                await db.SaveChangesAsync();
            });

            return Task.CompletedTask;
        }
    }
}
