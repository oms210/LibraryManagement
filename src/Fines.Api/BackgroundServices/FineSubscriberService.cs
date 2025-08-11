// BackgroundServices/FineSubscriberService.cs
using System.Text.Json;
using System.Text.Json.Serialization;
using Fines.Api.Data;
using Fines.Api.Models;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace Fines.Api.BackgroundServices
{
    public class FineSubscriberService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ISubscriber _subscriber;
        private readonly ILogger<FineSubscriberService> _logger;
        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNameCaseInsensitive = true,
            NumberHandling = JsonNumberHandling.AllowReadingFromString // in case numbers arrive as strings
        };

        public FineSubscriberService(
            IServiceScopeFactory scopeFactory,
            IConnectionMultiplexer redis,
            ILogger<FineSubscriberService> logger)
        {
            _scopeFactory = scopeFactory;
            _subscriber = redis.GetSubscriber();
            _logger = logger;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _subscriber.Subscribe("fines", async (_, message) =>
            {
                try
                {
                    var overdueFineEvent = JsonSerializer.Deserialize<OverdueFineEvent>(message!, JsonOpts);
                    if (overdueFineEvent is null)
                    {
                        _logger.LogWarning("Received null/invalid overdue event: {Message}", message.ToString());
                        return;
                    }

                    using var scope = _scopeFactory.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<FinesDbContext>();

                    var fine = await db.Fines.FirstOrDefaultAsync(
                        f => f.MemberId == overdueFineEvent.MemberId && f.BookId == overdueFineEvent.BookId && !f.Collected);

                    if (fine == null)
                    {
                        fine = new Fine
                        {
                            MemberId = overdueFineEvent.MemberId,
                            BookId = overdueFineEvent.BookId
                        };
                        db.Fines.Add(fine);
                        _logger.LogInformation("Created new fine for Member {MemberId}, Book {BookId}", overdueFineEvent.MemberId, overdueFineEvent.BookId);
                    }
                    else
                    {
                        _logger.LogDebug("Fine already exists for Member {MemberId}, Book {BookId}", overdueFineEvent.MemberId, overdueFineEvent.BookId);
                    }

                    await db.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to handle overdue event: {Payload}", message.ToString());
                }
            });

            return Task.CompletedTask;
        }
    }
}
