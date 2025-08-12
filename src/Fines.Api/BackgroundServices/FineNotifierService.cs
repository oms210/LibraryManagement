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
                .Where(f => !f.Collected &&  f.Amount < 10 && f.CreatedAt < DateTime.UtcNow.AddMinutes(-1))
                .ToListAsync(stoppingToken);

            foreach (var fine in overdueFines)
            {
                var message = $"Member {fine.MemberId} has an overdue fine for Book {fine.BookId}. Amount: {fine.Amount:C}";
                _logger.LogWarning(message);
                fine.Amount++;
                await db.SaveChangesAsync();
                _notificationService.AddNotification(fine.MemberId,message);
            }

            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken); 
        }
    }
}
