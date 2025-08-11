using Quiz.Domain.Entities;

namespace QuizHub.Domain.Contracts
{
    public interface IResultsRepository
    {
        Task<(IReadOnlyList<QuizResult> Items, int Total)> GetPagedAsync(
            int page, int pageSize, string? quizId, string? userId, CancellationToken ct);
    }
}
