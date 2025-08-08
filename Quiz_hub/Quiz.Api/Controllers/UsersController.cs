using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quiz.Application.Feature.Token.Commands;
using QuizHub.Application.Feature.User.Commands;

namespace Quiz.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;
        public UsersController(IMediator mediator) { _mediator = mediator; }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromForm] RegisterUserCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] CreateTokenCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return result.Success ? Ok(result) : Unauthorized(result);
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult Me()
        {
            return Ok(new
            {
                sub = User.FindFirst("uid")?.Value,
                username = User.Identity?.Name ?? User.FindFirst("unique_name")?.Value,
                email = User.FindFirst("email")?.Value
            });
        }
    }
}





//using MediatR;
//using Microsoft.AspNetCore.Mvc;
//using QuizHub.Application.Feature.User.Commands;
////using Quiz.Application.Feature.Token.Command;

//namespace Quiz.Api.Controllers
//{
//    [ApiController]
//    [Route("api/users")]
//    public class UsersController : ControllerBase
//    {
//        private readonly IMediator _mediator;

//        public UsersController(IMediator mediator)
//        {
//            _mediator = mediator;
//        }

//        /// <summary>
//        /// Registracija novog korisnika
//        /// </summary>
//        [HttpPost("register")]
//        public async Task<IActionResult> Register([FromForm] RegisterUserCommand command, CancellationToken cancellationToken)
//        {
//            var result = await _mediator.Send(command, cancellationToken);
//            if (result.Success)
//                return Ok(result);

//            return BadRequest(result);
//        }

//        //[HttpPost("login")]
//        //public async Task<IActionResult> Login([FromBody] CreateTokenRequest command, CancellationToken cancellationToken)
//        //{
//        //    var result = await _mediator.Send(command, cancellationToken);
//        //    if (result.Success)
//        //        return Ok(result);

//        //    return Unauthorized(result);
//        //}
//    }
//}
