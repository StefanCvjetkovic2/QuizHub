using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quiz.Application.Feature.Admin.Questions.Commands.AddQuestion;
using Quiz.Application.Feature.Admin.Questions.Commands.DeleteQuestion;
using Quiz.Application.Feature.Admin.Questions.Commands.UpdateQuestion;

namespace Quiz.Api.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Policy = "Admin")]
    public class QuestionsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public QuestionsController(IMediator mediator) => _mediator = mediator;

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] AddQuestionCommand cmd, CancellationToken ct)
        {
            var res = await _mediator.Send(cmd, ct);
            return res.Success ? Ok(res) : BadRequest(res);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateQuestionCommand cmd, CancellationToken ct)
        {
            cmd.Id = id;
            var res = await _mediator.Send(cmd, ct);
            return res.Success ? Ok(res) : NotFound(res);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken ct)
        {
            var res = await _mediator.Send(new DeleteQuestionCommand { Id = id }, ct);
            return res.Success ? NoContent() : NotFound(res);
        }
    }
}
