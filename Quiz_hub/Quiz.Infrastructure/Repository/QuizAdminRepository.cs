using Microsoft.EntityFrameworkCore;
using QuizHub.Domain.Contracts;
using Quiz.Infrastructure.Data;
using Quiz.Domain.Entities;

namespace QuizHub.Infrastructure.Repository
{
    public class QuizAdminRepository : IQuizAdminRepository
    {
        private readonly QuizDbContext _ctx;
        public QuizAdminRepository(QuizDbContext ctx) => _ctx = ctx;

        public Task<Quiz.Domain.Entities.Quiz?> GetQuizAsync(string id, CancellationToken ct)
            => _ctx.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(a => a.Answers)
                .FirstOrDefaultAsync(q => q.Id == id, ct);

        public async Task<bool> CreateQuizAsync(Quiz.Domain.Entities.Quiz quiz, CancellationToken ct)
        {
            _ctx.Quizzes.Add(quiz);
            return await _ctx.SaveChangesAsync(ct) > 0;
        }

        public async Task<bool> UpdateQuizAsync(Quiz.Domain.Entities.Quiz quiz, CancellationToken ct)
        {
            _ctx.Quizzes.Update(quiz);
            return await _ctx.SaveChangesAsync(ct) > 0;
        }

        public async Task<bool> DeleteQuizAsync(string id, CancellationToken ct)
        {
            var q = await _ctx.Quizzes.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (q is null) return false;
            _ctx.Quizzes.Remove(q);
            return await _ctx.SaveChangesAsync(ct) > 0;
        }

        public Task<Question?> GetQuestionAsync(string id, CancellationToken ct) // <— NOVO
            => _ctx.Questions.Include(x => x.Answers).FirstOrDefaultAsync(x => x.Id == id, ct);

        public async Task<bool> AddQuestionAsync(Question q, CancellationToken ct)
        {
            _ctx.Questions.Add(q);
            return await _ctx.SaveChangesAsync(ct) > 0;
        }

        public async Task<bool> UpdateQuestionAsync(Question q, CancellationToken ct)
        {
            _ctx.Questions.Update(q);
            return await _ctx.SaveChangesAsync(ct) > 0;
        }

        public async Task<bool> DeleteQuestionAsync(string questionId, CancellationToken ct)
        {
            var q = await _ctx.Questions.FirstOrDefaultAsync(x => x.Id == questionId, ct);
            if (q is null) return false;
            _ctx.Questions.Remove(q);
            return await _ctx.SaveChangesAsync(ct) > 0;
        }

        public Task<Answer?> GetAnswerAsync(string id, CancellationToken ct) // <— NOVO
            => _ctx.Answers.FirstOrDefaultAsync(x => x.Id == id, ct);

        public async Task<bool> AddAnswerAsync(Answer a, CancellationToken ct)
        {
            _ctx.Answers.Add(a);
            return await _ctx.SaveChangesAsync(ct) > 0;
        }

        public async Task<bool> UpdateAnswerAsync(Answer a, CancellationToken ct)
        {
            _ctx.Answers.Update(a);
            return await _ctx.SaveChangesAsync(ct) > 0;
        }

        public async Task<bool> DeleteAnswerAsync(string answerId, CancellationToken ct)
        {
            var a = await _ctx.Answers.FirstOrDefaultAsync(x => x.Id == answerId, ct);
            if (a is null) return false;
            _ctx.Answers.Remove(a);
            return await _ctx.SaveChangesAsync(ct) > 0;
        }
    }
}
