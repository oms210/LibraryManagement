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
           // => await _db.Members.Include(m => m.Loans).ToListAsync();
         => await _db.Members.ToListAsync();

        [HttpPost]
        public async Task<ActionResult<Member>> CreateMember(Member member)
        {
            if (GetRole() != "manager") return Forbid();
            _db.Members.Add(member);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMembers), new { id = member.Id }, member);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMember(int id, Member member)
        {
            if (GetRole() != "manager") return Forbid();
            if (id != member.Id) return BadRequest();

            _db.Entry(member).State = EntityState.Modified;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMember(int id)
        {
            if (GetRole() != "manager") return Forbid();
            var member = await _db.Members.FindAsync(id);
            if (member == null) return NotFound();

            _db.Members.Remove(member);
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
