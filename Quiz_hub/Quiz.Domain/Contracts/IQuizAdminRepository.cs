using Quiz.Domain.Entities;

namespace QuizHub.Domain.Contracts
{
    public interface IQuizAdminRepository
    {
        // Quiz
        Task<Quiz.Domain.Entities.Quiz?> GetQuizAsync(string id, CancellationToken ct);
        Task<bool> CreateQuizAsync(Quiz.Domain.Entities.Quiz quiz, CancellationToken ct);
        Task<bool> UpdateQuizAsync(Quiz.Domain.Entities.Quiz quiz, CancellationToken ct);
        Task<bool> DeleteQuizAsync(string id, CancellationToken ct);

        // Question
        Task<Question?> GetQuestionAsync(string id, CancellationToken ct); // <— DODATO
        Task<bool> AddQuestionAsync(Question q, CancellationToken ct);
        Task<bool> UpdateQuestionAsync(Question q, CancellationToken ct);
        Task<bool> DeleteQuestionAsync(string questionId, CancellationToken ct);

        // Answer
        Task<Answer?> GetAnswerAsync(string id, CancellationToken ct); // <— DODATO
        Task<bool> AddAnswerAsync(Answer a, CancellationToken ct);
        Task<bool> UpdateAnswerAsync(Answer a, CancellationToken ct);
        Task<bool> DeleteAnswerAsync(string answerId, CancellationToken ct);
    }
}
