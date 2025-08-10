using MediatR;
using Microsoft.AspNetCore.Mvc;
using Quiz.Application.Feature.Quizzes.Queries.GetQuizzes;
using Quiz.Application.Feature.Quizzes.Queries.GetQuizDetail;

namespace Quiz.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizzesController : ControllerBase
    {
        private readonly IMediator _mediator;
        public QuizzesController(IMediator mediator) => _mediator = mediator;

        // GET /api/quizzes?categoryId=&difficulty=&q=&page=1&pageSize=10
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetQuizzesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return Ok(result);
        }

        // GET /api/quizzes/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] string id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetQuizDetailQuery { QuizId = id }, ct);
            if (result == null) return NotFound(new { message = "Quiz not found" });
            return Ok(result);
        }
    }
}
