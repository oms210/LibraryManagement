namespace Lending.Api.Models
{
    public class Book
    {
        public int Id { get; set; }
        public string ISBN { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public BookStatus Status { get; set; } = BookStatus.Available;
    }
    public enum BookStatus { Available, Borrowed, Overdue }

}
