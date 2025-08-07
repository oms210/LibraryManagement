using Lending.Api.Data;
using Lending.Api.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lending.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MembersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public MembersController(AppDbContext db)
        {
            _db = db;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Member>>> GetMembers()
            => await _db.Members.Include(m => m.Loans).ToListAsync();

        [HttpPost]
        public async Task<ActionResult<Member>> CreateMember(Member member)
        {
            _db.Members.Add(member);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMembers), new { id = member.Id }, member);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMember(int id, Member member)
        {
            if (id != member.Id) return BadRequest();

            _db.Entry(member).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMember(int id)
        {
            var member = await _db.Members.FindAsync(id);
            if (member == null) return NotFound();

            _db.Members.Remove(member);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
