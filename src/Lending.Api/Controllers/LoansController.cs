using Lending.Api.Data;
using Lending.Api.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lending.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoansController : ControllerBase
    {
        private readonly AppDbContext _db;

        public LoansController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Loan>>> GetLoans()
            => await _db.Loans
                .Include(l => l.Book)
                .Include(l => l.Member)
                .ToListAsync();

        [HttpPost("{memberId}/borrow/{bookId}")]
        public async Task<IActionResult> BorrowBook(int memberId, int bookId)
        {
            var member = await _db.Members.Include(m => m.Loans)
                                          .ThenInclude(l => l.Book)
                                          .FirstOrDefaultAsync(m => m.Id == memberId);
            var book = await _db.Books.FindAsync(bookId);

            if (member == null || book == null) return NotFound("Member or book not found");
            if (book.Status != BookStatus.Available) return BadRequest("Book is not available");
            if (member.Loans.Count(l => !l.Returned) >= 3) return BadRequest("Member already has 3 active loans");
            if (member.Loans.Any(l => !l.Returned && l.DueDate < DateTime.UtcNow))
                return BadRequest("Member has overdue books");

            var loan = new Loan
            {
                BookId = bookId,
                MemberId = memberId,
                BorrowedAt = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddMinutes(1),
                Returned = false
            };

            book.Status = BookStatus.Borrowed;

            _db.Loans.Add(loan);
            await _db.SaveChangesAsync();

            return Ok(loan);
        }

        [HttpPost("{loanId}/return")]
        public async Task<IActionResult> ReturnBook(int loanId)
        {
            var loan = await _db.Loans.Include(l => l.Book).FirstOrDefaultAsync(l => l.Id == loanId);
            if (loan == null || loan.Returned) return NotFound("Loan not found or already returned");

            loan.Returned = true;
            loan.Book.Status = BookStatus.Available;

            await _db.SaveChangesAsync();
            return Ok(loan);
        }
    }
}
