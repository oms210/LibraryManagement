namespace Lending.Api.Models
{
    public class Loan
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public Book Book { get; set; } = null!;
        public int MemberId { get; set; }
        public Member Member { get; set; } = null!;
        public DateTime Expiration { get; set; }
        public DateTime DueDate { get; internal set; }
        public bool Returned { get; internal set; }
        public DateTime BorrowedAt { get; internal set; }
    }
}
