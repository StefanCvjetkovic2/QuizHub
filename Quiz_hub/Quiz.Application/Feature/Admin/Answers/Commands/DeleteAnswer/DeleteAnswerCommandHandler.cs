using MediatR;
using QuizHub.Domain.Contracts;

namespace Quiz.Application.Feature.Admin.Answers.Commands.DeleteAnswer
{
    public class DeleteAnswerCommandHandler : IRequestHandler<DeleteAnswerCommand, DeleteAnswerResponse>
    {
        private readonly IQuizAdminRepository _repo;
        public DeleteAnswerCommandHandler(IQuizAdminRepository repo) => _repo = repo;

        public async Task<DeleteAnswerResponse> Handle(DeleteAnswerCommand req, CancellationToken ct)
        {
            var ok = await _repo.DeleteAnswerAsync(req.Id, ct);
            return new DeleteAnswerResponse { Success = ok, Message = ok ? "Answer deleted." : "Answer not found." };
        }
    }
}
