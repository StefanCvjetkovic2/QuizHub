using MediatR;
using QuizHub.Domain.Contracts;

namespace Quiz.Application.Feature.Admin.Questions.Commands.DeleteQuestion
{
    public class DeleteQuestionCommandHandler : IRequestHandler<DeleteQuestionCommand, DeleteQuestionResponse>
    {
        private readonly IQuizAdminRepository _repo;
        public DeleteQuestionCommandHandler(IQuizAdminRepository repo) => _repo = repo;

        public async Task<DeleteQuestionResponse> Handle(DeleteQuestionCommand req, CancellationToken ct)
        {
            // možeš i prvo GetQuestionAsync da vrati NotFound poruku
            var ok = await _repo.DeleteQuestionAsync(req.Id, ct);
            return new DeleteQuestionResponse { Success = ok, Message = ok ? "Question deleted." : "Question not found." };
        }
    }
}
