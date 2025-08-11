using MediatR;
using QuizHub.Domain.Contracts;

namespace Quiz.Application.Feature.Admin.Quizzes.Commands.UpdateQuiz
{
    public class UpdateQuizCommandHandler : IRequestHandler<UpdateQuizCommand, UpdateQuizResponse>
    {
        private readonly IQuizAdminRepository _repo;

        public UpdateQuizCommandHandler(IQuizAdminRepository repo)
        {
            _repo = repo;
        }

        public async Task<UpdateQuizResponse> Handle(UpdateQuizCommand req, CancellationToken ct)
        {
            var existing = await _repo.GetQuizAsync(req.Id, ct);
            if (existing is null)
            {
                return new UpdateQuizResponse
                {
                    Success = false,
                    Message = "Quiz not found."
                };
            }

            existing.Title = req.Title;
            existing.CategoryId = req.CategoryId;
            existing.Description = req.Description;
            existing.TimeLimitSeconds = req.TimeLimitSeconds;
            existing.Difficulty = req.Difficulty;

            var ok = await _repo.UpdateQuizAsync(existing, ct);

            return new UpdateQuizResponse
            {
                Success = ok,
                Message = ok ? "Quiz updated." : "Failed to update quiz."
            };
        }
    }
}
