using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quiz.Domain.Entities;
using Quiz.Domain.Constants;           // QuestionTypes
using Quiz.Infrastructure.Data;

namespace Quiz.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // vezujemo rezultat za ulogovanog korisnika
    public class ResultsController : ControllerBase
    {
        private readonly QuizDbContext _ctx;
        public ResultsController(QuizDbContext ctx) => _ctx = ctx;

        // ===== DTO-i koje prima front =====
        public record SubmittedAnswer
        {
            public string QuestionId { get; init; } = string.Empty;

            // Za Single/Multiple/TrueFalse možeš poslati Id-eve odabranih odgovora
            public string[]? SelectedAnswerIds { get; init; }

            // Za TrueFalse (ako ne šalješ Id) i za FillInTheBlank
            public string? Text { get; init; }
        }

        public record SubmitQuizRequest
        {
            public string QuizId { get; init; } = string.Empty;
            public int ElapsedSeconds { get; init; }
            public List<SubmittedAnswer> Answers { get; init; } = new();
        }

        [HttpPost]
        public async Task<IActionResult> Submit([FromBody] SubmitQuizRequest req, CancellationToken ct)
        {
            var quiz = await _ctx.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == req.QuizId, ct);

            if (quiz is null)
                return NotFound(new { message = "Quiz not found." });

            int total = quiz.Questions.Count;
            int correct = 0;
            var userAnswers = new List<UserAnswer>();

            foreach (var q in quiz.Questions.OrderBy(x => x.Order))
            {
                var provided = req.Answers.FirstOrDefault(a => a.QuestionId == q.Id);
                if (provided is null)
                {
                    userAnswers.Add(new UserAnswer { QuestionId = q.Id, AnswerText = "" });
                    continue;
                }

                bool isCorrect = false;

                switch (q.Type)
                {
                    case QuestionTypes.Single:
                        {
                            var sel = (provided.SelectedAnswerIds ?? Array.Empty<string>()).FirstOrDefault();
                            isCorrect = !string.IsNullOrWhiteSpace(sel)
                                        && q.Answers.Any(a => a.Id == sel && a.IsCorrect);
                            userAnswers.Add(new UserAnswer
                            {
                                QuestionId = q.Id,
                                AnswerText = string.Join(",", provided.SelectedAnswerIds ?? Array.Empty<string>())
                            });
                            break;
                        }
                    case QuestionTypes.Multiple:
                        {
                            var selected = new HashSet<string>((provided.SelectedAnswerIds ?? Array.Empty<string>())
                                                                .Where(s => !string.IsNullOrWhiteSpace(s)));
                            var correctSet = q.Answers.Where(a => a.IsCorrect).Select(a => a.Id).ToHashSet();
                            isCorrect = selected.SetEquals(correctSet); // mora potpuni set-match

                            userAnswers.Add(new UserAnswer
                            {
                                QuestionId = q.Id,
                                AnswerText = string.Join(",", selected)
                            });
                            break;
                        }
                    case QuestionTypes.TrueFalse:
                        {
                            // podržavamo i slanje ID-a i slanje tekst vrijednosti ("true"/"false")
                            if ((provided.SelectedAnswerIds?.Length ?? 0) > 0)
                            {
                                var selId = provided.SelectedAnswerIds![0];
                                isCorrect = q.Answers.Any(a => a.Id == selId && a.IsCorrect);
                                userAnswers.Add(new UserAnswer { QuestionId = q.Id, AnswerText = selId });
                            }
                            else
                            {
                                var txt = (provided.Text ?? "").Trim().ToLowerInvariant();
                                bool chosenTrue = txt is "true" or "tačno" or "tacno";
                                var correctAns = q.Answers.FirstOrDefault(a => a.IsCorrect);
                                bool correctTrue =
                                    (correctAns?.Text ?? "").Trim().Equals("Tačno", StringComparison.OrdinalIgnoreCase) ||
                                    (correctAns?.Text ?? "").Trim().Equals("True", StringComparison.OrdinalIgnoreCase);
                                isCorrect = chosenTrue == correctTrue;

                                userAnswers.Add(new UserAnswer { QuestionId = q.Id, AnswerText = txt });
                            }
                            break;
                        }
                    case QuestionTypes.FillIn:
                        {
                            var txt = (provided.Text ?? "").Trim();
                            isCorrect = q.Answers.Any(a =>
                                string.Equals(a.Text?.Trim(), txt, StringComparison.OrdinalIgnoreCase));

                            userAnswers.Add(new UserAnswer { QuestionId = q.Id, AnswerText = txt });
                            break;
                        }
                    default:
                        userAnswers.Add(new UserAnswer { QuestionId = q.Id, AnswerText = "" });
                        break;
                }

                if (isCorrect) correct++;
            }

            var userId =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("sub")?.Value ??
                User.Identity?.Name ??
                string.Empty;

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
                percentage = result.Percentage
            });
        }
    }
}
