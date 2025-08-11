using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quiz.Application.Feature.Admin.Quizzes.Commands.CreateQuiz;
using Quiz.Application.Feature.Admin.Quizzes.Commands.DeleteQuiz;
using Quiz.Application.Feature.Admin.Quizzes.Commands.UpdateQuiz;

namespace Quiz.Api.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Policy = "Admin")]
    public class QuizzesController : ControllerBase
    {
        private readonly IMediator _mediator;
        public QuizzesController(IMediator mediator) => _mediator = mediator;

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateQuizCommand cmd, CancellationToken ct)
        {
            // Primer: ako želiš iz JWT da setuješ ko je kreirao:
            // cmd.CreatedByUserId = User.FindFirst("uid")?.Value ?? cmd.CreatedByUserId;
            var res = await _mediator.Send(cmd, ct);
            return res.Success ? Ok(res) : BadRequest(res);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateQuizCommand cmd, CancellationToken ct)
        {
            cmd.Id = id;
            var res = await _mediator.Send(cmd, ct);
            return res.Success ? Ok(res) : NotFound(res);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] string id, CancellationToken ct)
        {
            var res = await _mediator.Send(new DeleteQuizCommand { Id = id }, ct);
            return res.Success ? NoContent() : NotFound(res);
        }
    }
}
