using System.Collections.Concurrent;

namespace Fines.Api.Services
{
    public class NotificationService
    {
        private readonly ConcurrentQueue<string> _notifications = new();

        public void AddNotification(string message)
        {
            _notifications.Enqueue(message);
        }

        public IEnumerable<string> GetNotifications()
        {
            return _notifications.ToArray();
        }
    }
}
