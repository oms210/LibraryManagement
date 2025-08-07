using Microsoft.EntityFrameworkCore;
using Fines.Api.Models;

namespace Fines.Api.Data
{
    public class FinesDbContext : DbContext
    {
        public FinesDbContext(DbContextOptions<FinesDbContext> options) : base(options) { }
        public DbSet<Fine> Fines => Set<Fine>();
    }
}
