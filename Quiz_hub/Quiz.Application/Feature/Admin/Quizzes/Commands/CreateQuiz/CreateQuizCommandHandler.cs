using MediatR;
using QuizHub.Domain.Contracts;

namespace Quiz.Application.Feature.Admin.Quizzes.Commands.CreateQuiz
{
    public class CreateQuizCommandHandler : IRequestHandler<CreateQuizCommand, CreateQuizResponse>
    {
        private readonly IQuizAdminRepository _repo;
        public CreateQuizCommandHandler(IQuizAdminRepository repo) => _repo = repo;

        public async Task<CreateQuizResponse> Handle(CreateQuizCommand r, CancellationToken ct)
        {
            var quiz = new Quiz.Domain.Entities.Quiz
            {
                Id = Guid.NewGuid().ToString(),
                Title = r.Title,
                CategoryId = r.CategoryId,
                Description = r.Description,
                TimeLimitSeconds = r.TimeLimitSeconds,
                Difficulty = r.Difficulty,
                CreatedByUserId = r.CreatedByUserId
            };
            var ok = await _repo.CreateQuizAsync(quiz, ct);
            return new CreateQuizResponse { Success = ok, QuizId = ok ? quiz.Id : null, Message = ok ? "Created." : "Failed." };
        }
    }
}
