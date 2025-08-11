using MediatR;
using QuizHub.Domain.Contracts;

namespace Quiz.Application.Feature.Admin.Questions.Commands.UpdateQuestion
{
    public class UpdateQuestionCommandHandler : IRequestHandler<UpdateQuestionCommand, UpdateQuestionResponse>
    {
        private readonly IQuizAdminRepository _repo;
        public UpdateQuestionCommandHandler(IQuizAdminRepository repo) => _repo = repo;

        public async Task<UpdateQuestionResponse> Handle(UpdateQuestionCommand req, CancellationToken ct)
        {
            var q = await _repo.GetQuestionAsync(req.Id, ct);
            if (q is null)
                return new UpdateQuestionResponse { Success = false, Message = "Question not found." };

            q.Text = req.Text;
            q.Type = req.Type;
            q.Order = req.Order;

            var ok = await _repo.UpdateQuestionAsync(q, ct);
            return new UpdateQuestionResponse { Success = ok, Message = ok ? "Question updated." : "No changes saved." };
        }
    }
}
