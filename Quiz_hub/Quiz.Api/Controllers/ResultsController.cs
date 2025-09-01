using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quiz.Domain.Entities;
using Quiz.Domain.Constants;
using Quiz.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;

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


        // ====== DODAJ OVO U ResultsController ======

        public record MyResultItemDto(
            string Id,
            string QuizId,
            string QuizTitle,
            int Score,
            int Total,
            float Percentage,
            int TimeTakenSeconds,
            DateTime DateTaken
        );

        public record PagedDto<T>(IEnumerable<T> Items, int Total, int Page, int PageSize);

        public record ResultDetailsDto(
            string ResultId,
            string QuizId,
            string QuizTitle,
            int Correct,
            int Total,
            float Percentage,
            int TimeTakenSeconds,
            DateTime DateTaken,
            IEnumerable<QuestionResultDto> Details
        );

        // GET /api/results/my?page=1&pageSize=50&quizId=...
        [HttpGet("my")]
        public async Task<ActionResult<PagedDto<MyResultItemDto>>> GetMyResults(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? quizId = null,
            CancellationToken ct = default
        )
        {
            var userId =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("sub")?.Value ??
                User.Identity?.Name ?? string.Empty;

            var query = _ctx.QuizResults
                .AsNoTracking()
                .Include(r => r.Quiz)!.ThenInclude(q => q.Questions)
                .Where(r => r.UserId == userId);

            if (!string.IsNullOrWhiteSpace(quizId))
                query = query.Where(r => r.QuizId == quizId);

            var total = await query.CountAsync(ct);

            var items = await query
                .OrderByDescending(r => r.DateTaken)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new MyResultItemDto(
                    r.Id,
                    r.QuizId,
                    r.Quiz!.Title,
                    r.Score,
                    r.Quiz!.Questions.Count,
                    r.Percentage,
                    r.TimeTakenSeconds,
                    r.DateTaken
                ))
                .ToListAsync(ct);

            return Ok(new PagedDto<MyResultItemDto>(items, total, page, pageSize));
        }

        // GET /api/results/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ResultDetailsDto>> GetResult(string id, CancellationToken ct)
        {
            var userId =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                User.FindFirst("sub")?.Value ??
                User.Identity?.Name ?? string.Empty;

            var res = await _ctx.QuizResults
                .Include(r => r.Quiz)!.ThenInclude(q => q.Questions)!.ThenInclude(q => q.Answers)
                .Include(r => r.UserAnswers)
                .FirstOrDefaultAsync(r => r.Id == id, ct);

            if (res == null) return NotFound();
            if (res.UserId != userId) return Forbid();

            var details = new List<QuestionResultDto>();
            int correctCount = 0;

            foreach (var q in res.Quiz!.Questions.OrderBy(x => x.Order))
            {
                var ua = res.UserAnswers.FirstOrDefault(x => x.QuestionId == q.Id);

                var correctIds = q.Answers.Where(a => a.IsCorrect).Select(a => a.Id).ToList();
                var correctTexts = q.Answers.Where(a => a.IsCorrect)
                                            .Select(a => a.Text ?? "")
                                            .Where(t => !string.IsNullOrWhiteSpace(t))
                                            .ToList();

                var userSelectedIds = new List<string>();
                string? userText = null;
                bool isCorrect = false;

                switch (q.Type)
                {
                    case QuestionTypes.Single:
                        {
                            var ids = (ua?.AnswerText ?? "")
                                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                            if (ids.Length == 1)
                            {
                                userSelectedIds.Add(ids[0]);
                                isCorrect = correctIds.Contains(ids[0]);
                            }
                            break;
                        }
                    case QuestionTypes.Multiple:
                        {
                            var ids = (ua?.AnswerText ?? "")
                                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                            userSelectedIds.AddRange(ids);
                            var setUser = userSelectedIds.ToHashSet();
                            var setCorrect = correctIds.ToHashSet();
                            isCorrect = setUser.SetEquals(setCorrect);
                            break;
                        }
                    case QuestionTypes.TrueFalse:
                        {
                            var txt = (ua?.AnswerText ?? "").Trim().ToLowerInvariant();

                            // mogao je biti upisan id ili tekst "true/false"/"tačno"/"netačno"
                            if (!string.IsNullOrEmpty(txt) && q.Answers.Any(a => a.Id == txt))
                            {
                                userSelectedIds.Add(txt);
                                isCorrect = correctIds.Contains(txt);
                            }
                            else
                            {
                                userText = txt;
                                var corrAns = q.Answers.FirstOrDefault(a => a.IsCorrect);
                                bool corrTrue = IsTrueLabel(corrAns?.Text) ||
                                    (corrAns?.Text ?? "").Trim().Equals("True", StringComparison.OrdinalIgnoreCase);
                                bool chosenTrue = IsTrueLabel(userText);
                                isCorrect = chosenTrue == corrTrue;
                            }
                            break;
                        }
                    case QuestionTypes.FillIn:
                        {
                            userText = (ua?.AnswerText ?? "");
                            isCorrect = q.Answers.Any(a =>
                                string.Equals(a.Text?.Trim(), userText.Trim(), StringComparison.OrdinalIgnoreCase));
                            break;
                        }
                }

                if (isCorrect) correctCount++;

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

            var dto = new ResultDetailsDto(
                res.Id,
                res.QuizId,
                res.Quiz.Title,
                correctCount,
                res.Quiz.Questions.Count,
                res.Percentage,
                res.TimeTakenSeconds,
                res.DateTaken,
                details
            );

            return Ok(dto);
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

        public record LeaderboardItemDto
        {
            public int Rank { get; init; }
            public string UserId { get; init; } = "";
            public string UserName { get; init; } = ""; // fallback na anonimno ako nemamo ime
            public string QuizId { get; init; } = "";
            public string QuizTitle { get; init; } = "";
            public int Score { get; init; }
            public int Total { get; init; }
            public int Percentage { get; init; }
            public int? TimeTakenSeconds { get; init; }
            public DateTime DateTaken { get; init; }
            public bool IsYou { get; init; }
        }

        public record LeaderboardResponse
        {
            public List<LeaderboardItemDto> Items { get; init; } = new();
            public int Total { get; init; }
            public int Page { get; init; }
            public int PageSize { get; init; }
            public int? YourRank { get; init; }     // pozicija u trenutnom preseku
        }

        /// <summary>
        /// GET api/results/leaderboard?quizId=...&period=week|month|all&page=1&pageSize=50
        /// period:
        ///   - week  => poslednjih 7 dana
        ///   - month => poslednjih 30 dana
        ///   - all   => bez vremenskog filtra
        /// Rangiranje: Score desc, Percentage desc, TimeTakenSeconds asc, DateTaken asc.
        /// U listu ulazi NAJBOLJI pokušaj po korisniku (po istim kriterijumima).
        /// </summary>

        [HttpGet("leaderboard")]
        public async Task<IActionResult> Leaderboard(
      [FromQuery] string quizId,
      [FromQuery] string period = "all",
      [FromQuery] int page = 1,
      [FromQuery] int pageSize = 50,
      CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(quizId))
                return BadRequest("quizId is required.");

            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var now = DateTime.UtcNow;
            DateTime? from = period switch
            {
                "week" => now.AddDays(-7),
                "month" => now.AddMonths(-1),
                _ => null
            };

            // ukupno pitanja za kviz (za kolonu "5 / 5")
            var quiz = await _ctx.Quizzes
                .Include(q => q.Questions)
                .AsNoTracking()
                .FirstOrDefaultAsync(q => q.Id == quizId, ct);
            if (quiz is null) return NotFound();
            var totalQuestions = quiz.Questions.Count;

            var baseQuery = _ctx.QuizResults
                .AsNoTracking()
                .Where(r => r.QuizId == quizId);

            if (from is not null)
                baseQuery = baseQuery.Where(r => r.DateTaken >= from.Value);

            // ⬇⬇⬇ JOIN na korisnike da uzmemo pravo korisničko ime
            var query =
                from r in baseQuery
                join u in _ctx.Users.AsNoTracking() on r.UserId equals u.Id
                select new
                {
                    r.UserId,
                    UserName = u.Username,               // ← OVO VRATI
                    r.Score,
                    r.Percentage,
                    r.TimeTakenSeconds,
                    r.DateTaken
                };

            // sortiranje: procenat ↓, vreme ↑, datum ↑
            query = query.OrderByDescending(x => x.Percentage)
                         .ThenBy(x => x.TimeTakenSeconds)
                         .ThenBy(x => x.DateTaken);

            var total = await query.CountAsync(ct);
            var rows = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

            var items = rows.Select((x, i) => new
            {
                rank = (page - 1) * pageSize + (i + 1),
                userId = x.UserId,
                userName = string.IsNullOrWhiteSpace(x.UserName) ? $"user_{x.UserId[..Math.Min(6, x.UserId.Length)]}" : x.UserName,
                score = x.Score,
                total = totalQuestions,
                percentage = x.Percentage,
                timeTakenSeconds = x.TimeTakenSeconds ,
                dateTaken = x.DateTaken
            });

            return Ok(new { items, total, page, pageSize });
        }





    }


}
