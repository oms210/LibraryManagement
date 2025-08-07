using Lending.Api.Data;
using Lending.Api.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace Lending.Api.Services
{
    public class LoanService
    {
        private readonly AppDbContext _db;
        public LoanService(AppDbContext db) => _db = db;

        public async Task<bool> CanBorrowAsync(Member member)
        {
            var activeLoans = await _db.Loans
                .Where(l => l.MemberId == member.Id && l.Book.Status != BookStatus.Available)
                .CountAsync();

            var hasOverdue = await _db.Loans
                .AnyAsync(l => l.MemberId == member.Id && l.Book.Status == BookStatus.Overdue);

            return activeLoans < 3 && !hasOverdue;
        }

        public async Task<Loan?> LendBookAsync(int bookId, int memberId, int days)
        {
            var book = await _db.Books.FindAsync(bookId);
            var member = await _db.Members.Include(m => m.Loans).FirstOrDefaultAsync(m => m.Id == memberId);

            if (book == null || member == null || book.Status != BookStatus.Available)
                return null;

            if (!await CanBorrowAsync(member))
                return null;

            var loan = new Loan
            {
                BookId = bookId,
                MemberId = memberId,
                Expiration = DateTime.UtcNow.AddDays(days)
            };

            book.Status = BookStatus.Borrowed;
            _db.Loans.Add(loan);
            await _db.SaveChangesAsync();
            return loan;
        }
    }
}
