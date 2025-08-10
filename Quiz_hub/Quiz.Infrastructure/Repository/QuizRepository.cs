using Microsoft.EntityFrameworkCore;
using Quiz.Domain.Contracts;
using Quiz.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Quiz.Infrastructure.Repository
{
    public class QuizRepository : IQuizRepository
    {
        private readonly QuizDbContext _ctx;
        public QuizRepository(QuizDbContext ctx) => _ctx = ctx;

        public async Task<(IReadOnlyList<Domain.Entities.Quiz> Items, int TotalCount)> GetPagedAsync(
            int page, int pageSize,
            string? categoryId,
            int? difficulty,
            string? q,
            CancellationToken ct)
        {
            var query = _ctx.Quizzes
                .AsNoTracking()
                .Include(x => x.Questions)
                .Include(x => x.Category)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(categoryId))
                query = query.Where(x => x.CategoryId == categoryId);

            if (difficulty.HasValue)
                query = query.Where(x => x.Difficulty == difficulty.Value);

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim();
                query = query.Where(x =>
                    x.Title.Contains(term) ||
                    (x.Description != null && x.Description.Contains(term)));
            }

            var total = await query.CountAsync(ct);

            var items = await query
                .OrderByDescending(x => x.Id) // ili CreatedAt ako imaš
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, total);
        }

        public Task<Domain.Entities.Quiz?> GetDetailAsync(string quizId, CancellationToken ct)
            => _ctx.Quizzes
                .AsNoTracking()
                .Include(q => q.Category)
                .Include(q => q.Questions)
                    .ThenInclude(qq => qq.Answers)
                .FirstOrDefaultAsync(q => q.Id == quizId, ct);
    }
}
