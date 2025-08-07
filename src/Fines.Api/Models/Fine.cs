namespace Fines.Api.Models
{
    public class Fine
    {
        public int Id { get; set; }
        public int MemberId { get; set; }
        public int BookId { get; set; }
        public decimal Amount { get; set; } = 2;
        public bool Collected { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastNotification { get; set; } = DateTime.UtcNow;
    }
}
