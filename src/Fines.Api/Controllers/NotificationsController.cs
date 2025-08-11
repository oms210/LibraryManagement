using Fines.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Fines.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationService _notifications;

        public NotificationsController(NotificationService notifications)
        {
            _notifications = notifications;
        }

        [HttpGet]
        public IActionResult GetForMember()
        {
            var role = Request.Headers["Role"].ToString().Trim().ToLowerInvariant();
            if (role != "member")
            {
                
                return Forbid();
            }

            if (!Request.Headers.TryGetValue("Member-Id", out var raw)
                || !int.TryParse(raw.ToString(), out var memberId))
            {
                return BadRequest("Member-Id header is required and must be an integer.");
            }

            var items = _notifications.GetNotificationsForMember(memberId);
            return Ok(items);
        }
    }
}
