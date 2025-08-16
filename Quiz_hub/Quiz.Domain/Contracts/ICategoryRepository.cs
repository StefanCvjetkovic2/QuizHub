using Quiz.Domain.Entities;

namespace QuizHub.Domain.Contracts
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllAsync(CancellationToken ct);
        Task<Category?> GetByIdAsync(int id, CancellationToken ct);
        Task<bool> CreateAsync(Category c, CancellationToken ct);
        Task<bool> UpdateAsync(Category c, CancellationToken ct);
        Task<bool> DeleteAsync(int id, CancellationToken ct);


        // Novo: korisno za validacije i zaštitu brisanja
        Task<bool> ExistsAsync(int id, CancellationToken ct);
        Task<bool> IsNameTakenAsync(string name, int? excludeId, CancellationToken ct);
        Task<bool> IsInUseAsync(int id, CancellationToken ct);
    }
}
