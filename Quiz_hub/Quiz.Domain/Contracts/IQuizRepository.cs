using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Quiz.Domain.Contracts
{
    public interface IQuizRepository
    {
        Task<(IReadOnlyList<Quiz.Domain.Entities.Quiz> Items, int TotalCount)> GetPagedAsync(
            int page, int pageSize,
            int? categoryId,
            int? difficulty,
            string? q,
            CancellationToken ct);

        Task<Entities.Quiz?> GetDetailAsync(string quizId, CancellationToken ct);
    }
}
