using Lending.Api.Data;
using Lending.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lending.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _db;

        public BooksController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
            => await _db.Books.ToListAsync();
        [HttpPost]
        public async Task<ActionResult<Book>> CreateBook(Book book)
        {
            if (GetRole() != "manager") return Forbid();
            _db.Books.Add(book);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBooks), new { id = book.Id }, book);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBook(int id, Book book)
        {
            if (GetRole() != "manager") return Forbid();
            if (id != book.Id) return BadRequest();

            _db.Entry(book).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            if (GetRole() != "manager") return Forbid();
            var hasActiveLoans = await _db.Loans.AnyAsync(l => l.BookId == id && !l.Returned);
            if (hasActiveLoans) 
                return BadRequest("Cannot delete a book with active loans.");
            var book = await _db.Books.FindAsync(id);
            if (book == null) return NotFound();

            _db.Books.Remove(book);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        #region "Private Methods"
        //Quick fix to get the role from the request headers.
        //In real world applications, this should be handled by a proper authentication and authorization mechanism (like adding JWT tokens or using ASP.NET Core Identity).
        private string GetRole() =>
        Request.Headers.TryGetValue("Role", out var role) ? role.ToString() : "member";
        #endregion
    }
}
