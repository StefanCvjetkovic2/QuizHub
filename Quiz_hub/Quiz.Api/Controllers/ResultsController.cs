using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quiz.Domain.Entities;
using Quiz.Domain.Constants;
using Quiz.Infrastructure.Data;

namespace Quiz.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ResultsController : ControllerBase
    {
        private readonly QuizDbContext _ctx;
        public ResultsController(QuizDbContext ctx) => _ctx = ctx;

        public record SubmittedAnswer
        {
            public string QuestionId { get; init; } = string.Empty;
            public string[]? SelectedAnswerIds { get; init; }
            public string? Text { get; init; }
        }

        public record SubmitQuizRequest
        {
            public string QuizId { get; init; } = string.Empty;
            public int ElapsedSeconds { get; init; }
            public List<SubmittedAnswer> Answers { get; init; } = new();
        }

        public record QuestionResultDto
        {
            public string QuestionId { get; init; } = string.Empty;
            public bool IsCorrect { get; init; }
            public List<string> CorrectAnswerIds { get; init; } = new();
            public List<string> CorrectAnswerTexts { get; init; } = new();
            public List<string> UserSelectedAnswerIds { get; init; } = new();
            public string? UserText { get; init; }
        }

        private static bool IsTrueLabel(string? s)
        {
            var x = (s ?? "").Trim().ToLowerInvariant();
            return x is "true" or "tačno" or "tacno";
        }

        [HttpPost]
        public async Task<IActionResult> Submit([FromBody] SubmitQuizRequest req, CancellationToken ct)
        {
            var quiz = await _ctx.Quizzes
                .Include(q => q.Questions).ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == req.QuizId, ct);

            if (quiz is null) return NotFound(new { message = "Quiz not found." });

            int total = quiz.Questions.Count;
            int correct = 0;

            var userAnswers = new List<UserAnswer>();
            var details = new List<QuestionResultDto>();

            foreach (var q in quiz.Questions.OrderBy(x => x.Order))
            {
                var provided = req.Answers.FirstOrDefault(a => a.QuestionId == q.Id);

                bool isCorrect = false;
                var correctIds = q.Answers.Where(a => a.IsCorrect).Select(a => a.Id).ToList();
                var correctTexts = q.Answers.Where(a => a.IsCorrect).Select(a => a.Text ?? "")
                                            .Where(t => !string.IsNullOrWhiteSpace(t)).ToList();

                var userSelectedIds = new List<string>();
                string? userText = null;

                switch (q.Type)
                {
                    case QuestionTypes.Single:
                        {
                            var sel = (provided?.SelectedAnswerIds ?? Array.Empty<string>()).FirstOrDefault();
                            if (!string.IsNullOrWhiteSpace(sel))
                            {
                                userSelectedIds.Add(sel);
                                isCorrect = correctIds.Contains(sel);
                            }
                            userAnswers.Add(new UserAnswer { QuestionId = q.Id, AnswerText = string.Join(",", userSelectedIds) });
                            break;
                        }

                    case QuestionTypes.Multiple:
                        {
                            var selected = new HashSet<string>((provided?.SelectedAnswerIds ?? Array.Empty<string>())
                                                               .Where(s => !string.IsNullOrWhiteSpace(s)));
                            userSelectedIds.AddRange(selected);
                            var correctSet = correctIds.ToHashSet();
                            isCorrect = selected.SetEquals(correctSet);
                            userAnswers.Add(new UserAnswer { QuestionId = q.Id, AnswerText = string.Join(",", userSelectedIds) });
                            break;
                        }

                    case QuestionTypes.TrueFalse:
                        {
                            // 1) ako je poslat ID → poredi ID
                            if ((provided?.SelectedAnswerIds?.Length ?? 0) > 0)
                            {
                                var selId = provided!.SelectedAnswerIds![0];
                                userSelectedIds.Add(selId);
                                isCorrect = correctIds.Contains(selId);
                                userAnswers.Add(new UserAnswer { QuestionId = q.Id, AnswerText = selId });
                            }
                            // 2) ako je poslat tekst → poredi true/false
                            else if (!string.IsNullOrWhiteSpace(provided?.Text))
                            {
                                userText = (provided!.Text ?? "").Trim().ToLowerInvariant();
                                bool chosenTrue = userText is "true" or "tačno" or "tacno";
                                var correctAns = q.Answers.FirstOrDefault(a => a.IsCorrect);
                                bool correctTrue = IsTrueLabel(correctAns?.Text) ||
                                    (correctAns?.Text ?? "").Trim().Equals("True", StringComparison.OrdinalIgnoreCase);
                                isCorrect = chosenTrue == correctTrue;
                                userAnswers.Add(new UserAnswer { QuestionId = q.Id, AnswerText = userText });
                            }
                            // 3) uopšte nije odgovoreno → NETAČNO
                            else
                            {
                                isCorrect = false;
                                userAnswers.Add(new UserAnswer { QuestionId = q.Id, AnswerText = "" });
                            }
                            break;
                        }

                    case QuestionTypes.FillIn:
                        {
                            userText = (provided?.Text ?? "").Trim();
                            isCorrect = q.Answers.Any(a => string.Equals(a.Text?.Trim(), userText, StringComparison.OrdinalIgnoreCase));
                            userAnswers.Add(new UserAnswer { QuestionId = q.Id, AnswerText = userText });
                            break;
                        }

                    default:
                        userAnswers.Add(new UserAnswer { QuestionId = q.Id, AnswerText = "" });
                        break;
                }

                if (isCorrect) correct++;

                details.Add(new QuestionResultDto
                {
                    QuestionId = q.Id,
                    IsCorrect = isCorrect,
                    CorrectAnswerIds = correctIds,
                    CorrectAnswerTexts = correctTexts,
                    UserSelectedAnswerIds = userSelectedIds,
                    UserText = userText
                });
            }

            var userId =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("sub")?.Value ??
                User.Identity?.Name ?? string.Empty;

            var result = new QuizResult
            {
                UserId = userId,
                QuizId = req.QuizId,
                Score = correct,
                Percentage = total == 0 ? 0 : (float)correct * 100f / total,
                TimeTakenSeconds = req.ElapsedSeconds,
                DateTaken = DateTime.UtcNow,
                UserAnswers = userAnswers
            };

            _ctx.QuizResults.Add(result);
            await _ctx.SaveChangesAsync(ct);

            return Ok(new
            {
                success = true,
                resultId = result.Id,
                correct,
                total,
                percentage = result.Percentage,
                details   // ⬅ FE koristi ovo za prikaz
            });
        }
    }
}
