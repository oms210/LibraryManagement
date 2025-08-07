using Microsoft.EntityFrameworkCore;
using Lending.Api.Models;
using Lending.Api.Models;

namespace Lending.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Book> Books => Set<Book>();
        public DbSet<Member> Members => Set<Member>();
        public DbSet<Loan> Loans => Set<Loan>();
    }
}
