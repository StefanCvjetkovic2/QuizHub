using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quiz.Application.Feature.Admin.Answers.Commands.AddAnswer;
using Quiz.Application.Feature.Admin.Answers.Commands.UpdateAnswer;
using Quiz.Application.Feature.Admin.Answers.Commands.DeleteAnswer;

namespace Quiz.Api.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Policy = "Admin")]
    public class AnswersController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AnswersController(IMediator mediator) => _mediator = mediator;

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] AddAnswerCommand cmd, CancellationToken ct)
        {
            var res = await _mediator.Send(cmd, ct);
            return res.Success ? Ok(res) : BadRequest(res);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateAnswerCommand cmd, CancellationToken ct)
        {
            cmd.Id = id;
            var res = await _mediator.Send(cmd, ct);
            return res.Success ? Ok(res) : NotFound(res);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken ct)
        {
            var res = await _mediator.Send(new DeleteAnswerCommand { Id = id }, ct);
            return res.Success ? NoContent() : NotFound(res);
        }
    }
}
