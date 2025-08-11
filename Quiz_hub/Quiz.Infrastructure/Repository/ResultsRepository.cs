using Microsoft.EntityFrameworkCore;
using QuizHub.Domain.Contracts;
using Quiz.Infrastructure.Data;
using Quiz.Domain.Entities;

namespace QuizHub.Infrastructure.Repository
{
    public class ResultsRepository : IResultsRepository
    {
        private readonly QuizDbContext _ctx;
        public ResultsRepository(QuizDbContext ctx) => _ctx = ctx;

        public async Task<(IReadOnlyList<QuizResult> Items, int Total)> GetPagedAsync(
            int page, int pageSize, string? quizId, string? userId, CancellationToken ct)
        {
            var q = _ctx.QuizResults
                .AsNoTracking()
                .Include(r => r.User)
                .Include(r => r.Quiz)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(quizId)) q = q.Where(x => x.QuizId == quizId);
            if (!string.IsNullOrWhiteSpace(userId)) q = q.Where(x => x.UserId == userId);

            var total = await q.CountAsync(ct);

            var items = await q.OrderByDescending(x => x.DateTaken)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, total);
        }
    }
}
