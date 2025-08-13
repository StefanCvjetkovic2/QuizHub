using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Quiz.Application.Feature.Admin.Quizzes.Commands.CreateQuiz;
using Quiz.Application.Feature.Admin.Quizzes.Commands.UpdateQuiz;
using Quiz.Application.Feature.Admin.Quizzes.Commands.DeleteQuiz;
using Quiz.Application.Feature.Quizzes.Queries.GetQuizzes;
using Quiz.Application.Feature.Quizzes.Queries.GetQuizDetail;

namespace Quiz.Api.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Policy = "Admin")]
    public class QuizzesController : ControllerBase
    {
        private readonly IMediator _mediator;
        public QuizzesController(IMediator mediator) => _mediator = mediator;

        // CREATE
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateQuizCommand cmd, CancellationToken ct)
        {
            // Ubaci autora iz tokena ako postoji (opciono)
            var uid = User?.FindFirst("uid")?.Value ?? User?.Identity?.Name;
            if (!string.IsNullOrWhiteSpace(uid) && string.IsNullOrWhiteSpace(cmd.CreatedByUserId))
                cmd.CreatedByUserId = uid!;

            var res = await _mediator.Send(cmd, ct);
            return res.Success ? Ok(res) : BadRequest(res);
        }

        // UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateQuizCommand cmd, CancellationToken ct)
        {
            cmd.Id = id;
            var res = await _mediator.Send(cmd, ct);
            return res.Success ? Ok(res) : NotFound(res);
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] string id, CancellationToken ct)
        {
            var res = await _mediator.Send(new DeleteQuizCommand { Id = id }, ct);
            return res.Success ? NoContent() : NotFound(res);
        }

        // LIST (admin pregled sa paginacijom/filtrima)
        [HttpGet]
        public async Task<IActionResult> Get(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? categoryId = null,
            [FromQuery] int? difficulty = null,
            [FromQuery] string? q = null,
            CancellationToken ct = default)
        {
            var res = await _mediator.Send(new GetQuizzesQuery
            {
                Page = page,
                PageSize = pageSize,
                CategoryId = categoryId,
                Difficulty = difficulty,
                Q = q
            }, ct);

            return Ok(res);
        }

        // DETAIL (admin vidi kompletan DTO – podešava se u samom Query handleru)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] string id, CancellationToken ct)
        {
            var res = await _mediator.Send(new GetQuizDetailQuery { QuizId = id }, ct);
            return res is null ? NotFound() : Ok(res);
        }
    }
}
