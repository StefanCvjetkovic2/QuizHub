using Microsoft.EntityFrameworkCore;
using Quiz.Domain.Contracts;
using Quiz.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Quiz.Infrastructure.Repository
{
    public class QuizRepository : IQuizRepository
    {
        private readonly QuizDbContext _ctx;
        public QuizRepository(QuizDbContext ctx) => _ctx = ctx;

        public async Task<(IReadOnlyList<Domain.Entities.Quiz> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            int? categoryId,
            int? difficulty,
            string? q,
            bool? isPublished,     // NOVO: opcioni filter
            CancellationToken ct)
        {
            // Osnovni upit
            var query = _ctx.Quizzes
                .AsNoTracking()
                .AsSplitQuery()                 // izbegava kart. eksploziju sa Include-ovima
                .Include(x => x.Category)
                .Include(x => x.Questions)
                    .ThenInclude(qq => qq.Answers)
                .AsQueryable();

            // Filteri
            if (categoryId.HasValue)
                query = query.Where(x => x.CategoryId == categoryId.Value);

            if (difficulty.HasValue)
                query = query.Where(x => x.Difficulty == difficulty.Value);

            if (isPublished.HasValue)
            {
                // Ako imaš IsPublished polje – filtriraj; u suprotnom ukloni ovaj blok.
                // query = query.Where(x => x.IsPublished == isPublished.Value);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim();

                // Case-insensitive LIKE (bolje od Contains za SQL i indeks)
                query = query.Where(x =>
                    EF.Functions.Like(x.Title, $"%{term}%") ||
                    (x.Description != null && EF.Functions.Like(x.Description, $"%{term}%"))
                );
            }

            // Ukupan broj pre paginacije
            var total = await query.CountAsync(ct);

            // Paginacija (basic guard)
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;

            // Napomena: Sortiranje po Guid string Id nije hronološko; zadržaćemo tvoje,
            // ili zameni sa Title/Category ako želiš stabilniji redosled.
            var items = await query
                .OrderByDescending(x => x.Id) // zameni u .OrderByDescending(x => x.Title) ako ti više odgovara
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, total);
        }

        public Task<Domain.Entities.Quiz?> GetDetailAsync(string quizId, CancellationToken ct)
            => _ctx.Quizzes
                .AsNoTracking()
                .AsSplitQuery()
                .Include(q => q.Category)
                .Include(q => q.Questions)
                    .ThenInclude(qq => qq.Answers)
                .FirstOrDefaultAsync(q => q.Id == quizId, ct);
    }
}
