using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Quiz.Domain.Contracts
{
    public interface IQuizRepository
    {
        Task<(IReadOnlyList<Domain.Entities.Quiz> Items, int TotalCount)> GetPagedAsync(
            int page,
            int pageSize,
            int? categoryId,
            int? difficulty,
            string? q,
            bool? isPublished,                 // NOVO: opcioni filter po objavi
            CancellationToken ct);

        Task<Domain.Entities.Quiz?> GetDetailAsync(string quizId, CancellationToken ct);
    }
}
