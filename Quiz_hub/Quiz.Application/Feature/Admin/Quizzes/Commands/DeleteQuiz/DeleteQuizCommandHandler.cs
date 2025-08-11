using MediatR;
using QuizHub.Domain.Contracts;

namespace Quiz.Application.Feature.Admin.Quizzes.Commands.DeleteQuiz
{
    public class DeleteQuizCommandHandler : IRequestHandler<DeleteQuizCommand, DeleteQuizResponse>
    {
        private readonly IQuizAdminRepository _repo;

        public DeleteQuizCommandHandler(IQuizAdminRepository repo)
        {
            _repo = repo;
        }

        public async Task<DeleteQuizResponse> Handle(DeleteQuizCommand req, CancellationToken ct)
        {
            var existing = await _repo.GetQuizAsync(req.Id, ct);
            if (existing is null)
            {
                return new DeleteQuizResponse
                {
                    Success = false,
                    Message = "Quiz not found."
                };
            }

            var ok = await _repo.DeleteQuizAsync(req.Id, ct);
            return new DeleteQuizResponse
            {
                Success = ok,
                Message = ok ? "Quiz deleted." : "Failed to delete quiz."
            };
        }
    }
}
