using Xunit;
using FluentAssertions;
using Lending.Api.Services;
using Lending.Api.Data;
using Lending.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.InMemory;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace Lending.Api.Tests.Services
{
    public class LoanServiceTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        [Fact]
        public async Task CanBorrowAsync_ShouldReturnTrue_WhenMemberHasLessThan3ActiveLoans_AndNoOverdue()
        {
            // Arrange
            var db = GetDbContext();
            var member = new Member { FirstName = "Alice", LastName = "Smith", Email = "alice@example.com" };
            db.Members.Add(member);
            db.SaveChanges();

            // Add 2 active loans (books not available, but not overdue)
            for (int i = 0; i < 2; i++)
            {
                var book = new Book { Title = $"Book{i}", Status = BookStatus.Borrowed };
                db.Books.Add(book);
                db.SaveChanges();
                db.Loans.Add(new Loan { BookId = book.Id, MemberId = member.Id });
            }
            db.SaveChanges();

            var service = new LoanService(db);

            // Act
            var canBorrow = await service.CanBorrowAsync(member);

            // Assert
            canBorrow.Should().BeTrue();
        }

        [Fact]
        public async Task CanBorrowAsync_ShouldReturnFalse_WhenMemberHas3OrMoreActiveLoans()
        {
            // Arrange
            var db = GetDbContext();
            var member = new Member { FirstName = "Bob", LastName = "Jones", Email = "bob@example.com" };
            db.Members.Add(member);
            db.SaveChanges();

            // Add 3 active loans (books not available, but not overdue)
            for (int i = 0; i < 3; i++)
            {
                var book = new Book { Title = $"Book{i}", Status = BookStatus.Borrowed };
                db.Books.Add(book);
                db.SaveChanges();
                db.Loans.Add(new Loan { BookId = book.Id, MemberId = member.Id });
            }
            db.SaveChanges();

            var service = new LoanService(db);

            // Act
            var canBorrow = await service.CanBorrowAsync(member);

            // Assert
            canBorrow.Should().BeFalse();
        }

        [Fact]
        public async Task CanBorrowAsync_ShouldReturnFalse_WhenMemberHasOverdueLoan()
        {
            // Arrange
            var db = GetDbContext();
            var member = new Member { FirstName = "Carol", LastName = "White", Email = "carol@example.com" };
            db.Members.Add(member);
            db.SaveChanges();

            var overdueBook = new Book { Title = "OverdueBook", Status = BookStatus.Overdue };
            db.Books.Add(overdueBook);
            db.SaveChanges();
            db.Loans.Add(new Loan { BookId = overdueBook.Id, MemberId = member.Id });
            db.SaveChanges();

            var service = new LoanService(db);

            // Act
            var canBorrow = await service.CanBorrowAsync(member);

            // Assert
            canBorrow.Should().BeFalse();
        }

        [Fact]
        public async Task LendBookAsync_ShouldReturnNull_IfBookNotAvailable()
        {
            // Arrange
            var db = GetDbContext();
            var member = new Member { FirstName = "Dan", LastName = "Brown", Email = "dan@example.com" };
            var book = new Book { Title = "UnavailableBook", Status = BookStatus.Borrowed };
            db.Members.Add(member);
            db.Books.Add(book);
            db.SaveChanges();

            var service = new LoanService(db);

            // Act
            var result = await service.LendBookAsync(book.Id, member.Id, 7);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task LendBookAsync_ShouldReturnNull_IfMemberCannotBorrow()
        {
            // Arrange
            var db = GetDbContext();
            var member = new Member { FirstName = "Eve", LastName = "Black", Email = "eve@example.com" };
            db.Members.Add(member);
            db.SaveChanges();

            // Add 3 active loans to block borrowing
            for (int i = 0; i < 3; i++)
            {
                var book = new Book { Title = $"Book{i}", Status = BookStatus.Borrowed };
                db.Books.Add(book);
                db.SaveChanges();
                db.Loans.Add(new Loan { BookId = book.Id, MemberId = member.Id });
            }
            db.SaveChanges();

            var availableBook = new Book { Title = "AvailableBook", Status = BookStatus.Available };
            db.Books.Add(availableBook);
            db.SaveChanges();

            var service = new LoanService(db);

            // Act
            var result = await service.LendBookAsync(availableBook.Id, member.Id, 7);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public async Task LendBookAsync_ShouldCreateLoan_AndSetBookStatus_WhenValid()
        {
            // Arrange
            var db = GetDbContext();
            var member = new Member { FirstName = "Frank", LastName = "Green", Email = "frank@example.com" };
            var book = new Book { Title = "AvailableBook", Status = BookStatus.Available };
            db.Members.Add(member);
            db.Books.Add(book);
            db.SaveChanges();

            var service = new LoanService(db);

            // Act
            var loan = await service.LendBookAsync(book.Id, member.Id, 10);

            // Assert
            loan.Should().NotBeNull();
            loan.BookId.Should().Be(book.Id);
            loan.MemberId.Should().Be(member.Id);
            loan.Expiration.Date.Should().Be(DateTime.UtcNow.AddDays(10).Date);
            var updatedBook = await db.Books.FindAsync(book.Id);
            updatedBook.Status.Should().Be(BookStatus.Borrowed);
        }
    }
}