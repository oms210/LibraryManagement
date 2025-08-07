//using Fines.Api.Data;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.Caching.Memory;

//namespace Fines.Api.BackgroundServices
//{
//    public class FineNotifierService : BackgroundService
//    {
//        private readonly IServiceScopeFactory _scopeFactory;
//        private readonly IMemoryCache _cache;


//        public FineNotifierService(IServiceScopeFactory scopeFactory) => _scopeFactory = scopeFactory;

//        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
//        {
//            while (!stoppingToken.IsCancellationRequested)
//            {
//                using var scope = _scopeFactory.CreateScope();
//                var db = scope.ServiceProvider.GetRequiredService<FinesDbContext>();

//                var fines = await db.Fines.Where(f => !f.Collected).ToListAsync();

//                foreach (var fine in fines)
//                {
//                    if ((DateTime.UtcNow - fine.LastNotification).TotalMinutes >= 1)
//                    {
//                        if (fine.Amount < 10) fine.Amount += 1;
//                        fine.LastNotification = DateTime.UtcNow;

//                        Console.WriteLine($"[FINE NOTICE] Member {fine.MemberId} owes ${fine.Amount} for Book {fine.BookId}");
//                    }
//                }

//                await db.SaveChangesAsync();
//                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
//            }
//        }
//    }
//}
using Fines.Api.Data;
using Fines.Api.Services;
using Microsoft.EntityFrameworkCore;

public class FineNotifierService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<FineNotifierService> _logger;
    private readonly NotificationService _notificationService;

    public FineNotifierService(IServiceProvider services, ILogger<FineNotifierService> logger, NotificationService notificationService)
    {
        _services = services;
        _logger = logger;
        _notificationService = notificationService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<FinesDbContext>();

            var overdueFines = await db.Fines
                .Where(f => !f.Collected && f.CreatedAt < DateTime.UtcNow.AddMinutes(-1))
                .ToListAsync(stoppingToken);

            foreach (var fine in overdueFines)
            {
                var message = $"Member {fine.MemberId} has an overdue fine for Book {fine.BookId}. Amount: {fine.Amount:C}";
                _logger.LogWarning(message);

                // Add to in-memory notification queue
                _notificationService.AddNotification(message);
            }

            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken); // check every 5 seconds
        }
    }
}
