using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Fines.Api.Data
{
    public class FinesDbContextFactory : IDesignTimeDbContextFactory<FinesDbContext>
    {
        public FinesDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<FinesDbContext>();
            optionsBuilder.UseSqlite("Data Source=./data/fines/fines.db");

            return new FinesDbContext(optionsBuilder.Options);
        }
    }
}
