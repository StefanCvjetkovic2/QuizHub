using Microsoft.EntityFrameworkCore;
using Quiz.Domain.Entities;
using Quiz.Infrastructure.Data;
using QuizHub.Domain.Contracts;

namespace QuizHub.Infrastructure.Repository
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly QuizDbContext _ctx;
        public CategoryRepository(QuizDbContext ctx) => _ctx = ctx;

        public async Task<IEnumerable<Category>> GetAllAsync(CancellationToken ct)
            => await _ctx.Categories.AsNoTracking().OrderBy(c => c.Name).ToListAsync(ct);

        public async Task<Category?> GetByIdAsync(int id, CancellationToken ct)
            => await _ctx.Categories.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

        public async Task<bool> CreateAsync(Category c, CancellationToken ct)
        {
            await _ctx.Categories.AddAsync(c, ct);
            return await _ctx.SaveChangesAsync(ct) > 0;
        }

        public async Task<bool> UpdateAsync(Category c, CancellationToken ct)
        {
            var exists = await _ctx.Categories.AnyAsync(x => x.Id == c.Id, ct);
            if (!exists) return false;

            _ctx.Categories.Update(c);
            return await _ctx.SaveChangesAsync(ct) > 0;
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken ct)
        {
            var entity = await _ctx.Categories.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity is null) return false;

            _ctx.Categories.Remove(entity);
            return await _ctx.SaveChangesAsync(ct) > 0;
        }

        public Task<bool> ExistsAsync(int id, CancellationToken ct)
            => _ctx.Categories.AnyAsync(x => x.Id == id, ct);

        public Task<bool> IsNameTakenAsync(string name, int? excludeId, CancellationToken ct)
        {
            var normalized = (name ?? string.Empty).Trim().ToLower();
            return _ctx.Categories.AnyAsync(c =>
                c.Name.ToLower() == normalized &&
                (!excludeId.HasValue || c.Id != excludeId.Value), ct);
        }

        public Task<bool> IsInUseAsync(int id, CancellationToken ct)
            => _ctx.Quizzes.AnyAsync(q => q.CategoryId == id, ct);
    }
}
