namespace Fines.Api.DTOs
{
    public class NotificationDto
    {
        public string Message { get; set; } = "";
        public DateTimeOffset Timestamp { get; set; }
    }
}
