namespace Fines.Api.Models
{
    public readonly record struct NotificationItem
    {
        public string Message { get; init; }
        public DateTimeOffset Timestamp { get; init; }
    }
}
