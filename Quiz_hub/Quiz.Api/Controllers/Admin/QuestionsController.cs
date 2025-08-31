using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quiz.Infrastructure.Data;

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
        private readonly QuizDbContext _db;

        public QuestionsController(IMediator mediator, QuizDbContext db)
        {
            _mediator = mediator;
            _db = db;
        }

        // ---------- HELPERS: mapiranje tipova ----------
        // DB -> Front
        private static string ToFrontType(string dbType) => dbType switch
        {
            "SingleChoice" => "single",
            "MultipleChoice" => "multiple",
            "TrueFalse" => "boolean",
            "FillInTheBlank" => "text",
            _ => dbType?.ToLower() ?? ""
        };

        // Front filter -> DB
        private static string? ToDbType(string? frontType) => frontType?.ToLower() switch
        {
            "single" => "SingleChoice",
            "multiple" => "MultipleChoice",
            "boolean" => "TrueFalse",
            "text" => "FillInTheBlank",
            _ => null
        };

        [HttpGet]
        public async Task<IActionResult> Get(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 50,
    [FromQuery] string? quizId = null,
    [FromQuery] string? q = null,
    [FromQuery] string? type = null,
    CancellationToken ct = default)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 50;

            var qry = _db.Questions.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(quizId))
                qry = qry.Where(x => x.QuizId == quizId);

            if (!string.IsNullOrWhiteSpace(q))
                qry = qry.Where(x => x.Text.Contains(q));

            if (!string.IsNullOrWhiteSpace(type))
            {
                var dbType = ToDbType(type);
                if (dbType is not null)
                    qry = qry.Where(x => x.Type == dbType);
            }

            var total = await qry.CountAsync(ct);

            var items = await qry
                .OrderBy(x => x.QuizId).ThenBy(x => x.Order)
                .Select(x => new
                {
                    x.Id,
                    x.QuizId,
                    QuizTitle = x.Quiz.Title,       // <-- OVO dodajemo
                    x.Text,
                    Type = ToFrontType(x.Type),
                    x.Order
                })
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return Ok(new { page, pageSize, total, items });
        }


        // ============ DETALJ (GET /api/admin/questions/{id}) ============
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id, CancellationToken ct)
        {
            var q = await _db.Questions
                .AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new
                {
                    x.Id,
                    x.QuizId,
                    x.Text,
                    Type = ToFrontType(x.Type),
                    x.Order,
                    Answers = x.Answers
                        .OrderBy(a => a.Id)
                        .Select(a => new { a.Id, a.Text, a.IsCorrect })
                        .ToList()
                })
                .FirstOrDefaultAsync(ct);

            return q is null ? NotFound() : Ok(q);
        }

        // ============ CREATE ============
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] AddQuestionCommand cmd, CancellationToken ct)
        {
            var res = await _mediator.Send(cmd, ct);
            return res.Success ? Ok(res) : BadRequest(res);
        }

        // ============ UPDATE ============
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateQuestionCommand cmd, CancellationToken ct)
        {
            cmd.Id = id;
            var res = await _mediator.Send(cmd, ct);
            return res.Success ? Ok(res) : NotFound(res);
        }

        // ============ DELETE ============
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken ct)
        {
            var res = await _mediator.Send(new DeleteQuestionCommand { Id = id }, ct);
            return res.Success ? NoContent() : NotFound(res);
        }
    }
}
