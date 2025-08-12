using Fines.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fines.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinesController : ControllerBase
    {
        private readonly FinesDbContext _db;

        public FinesController(FinesDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetFines() => Ok(await _db.Fines.ToListAsync());


        [HttpPost("{id}/collect")]
        public async Task<IActionResult> CollectFine(int id)
        {
            var fine = await _db.Fines.FindAsync(id);
            if (fine == null) return NotFound();

            fine.Collected = true;
            await _db.SaveChangesAsync();
            return Ok(fine);
        }
    }
}
