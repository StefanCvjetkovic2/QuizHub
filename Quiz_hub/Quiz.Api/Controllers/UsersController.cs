using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quiz.Application.Feature.Token.Commands;           // CreateTokenCommand (+ validator u Application)
using QuizHub.Application.Feature.User.Commands;        // RegisterUserCommand (+ validator u Application)

namespace Quiz.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;
        public UsersController(IMediator mediator) => _mediator = mediator;

        /// <summary>
        /// Registracija korisnika (multipart/form-data zbog slike).
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromForm] RegisterUserCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        /// <summary>
        /// Login (username ili email + password). Vraća JWT token + expiresAt itd.
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] CreateTokenCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            // očekuje se { success, message, token, expiresAtUtc, userId, username, email }
            return result.Success ? Ok(result) : Unauthorized(result);
        }

        /// <summary>
        /// Info o ulogovanom korisniku iz tokena (zahteva Authorization: Bearer ...).
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public IActionResult Me()
        {
            return Ok(new
            {
                sub = User.FindFirst("uid")?.Value,
                username = User.Identity?.Name ?? User.FindFirst("unique_name")?.Value,
                email = User.FindFirst("email")?.Value,
                roles = User.Claims.Where(c => c.Type == "role" || c.Type.EndsWith("/role")).Select(c => c.Value).ToArray()
            });
        }
    }
}
