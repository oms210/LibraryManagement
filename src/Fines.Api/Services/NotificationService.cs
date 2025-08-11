using System.Collections.Concurrent;
using Fines.Api.DTOs;
using Fines.Api.Models;
namespace Fines.Api.Services
{
    public sealed class NotificationService
    {
        // store per-member notifications
        private readonly ConcurrentDictionary<int, ConcurrentQueue<NotificationItem>> _notificationsByMember = new();

        public void AddNotification(int memberId, string message)
        {
            if (memberId < 0) return;
            var queue = _notificationsByMember.GetOrAdd(memberId, _ => new ConcurrentQueue<NotificationItem>());
            queue.Enqueue(new NotificationItem
            {
                Message = message,
                Timestamp = DateTimeOffset.UtcNow
            });
        }

        public IEnumerable<NotificationDto> GetNotificationsForMember(int memberId)
        {
            if (_notificationsByMember.TryGetValue(memberId, out var q))
            {
                return q.ToArray()
                        .OrderByDescending(n => n.Timestamp)
                        .Select(n => new NotificationDto
                        {
                            Message = n.Message,
                            Timestamp = n.Timestamp
                        });
            }
            return Enumerable.Empty<NotificationDto>();
        }
        
    }
}
