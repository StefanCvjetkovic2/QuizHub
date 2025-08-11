using MediatR;
using QuizHub.Domain.Contracts;

namespace Quiz.Application.Feature.Admin.Answers.Commands.UpdateAnswer
{
    public class UpdateAnswerCommandHandler : IRequestHandler<UpdateAnswerCommand, UpdateAnswerResponse>
    {
        private readonly IQuizAdminRepository _repo;
        public UpdateAnswerCommandHandler(IQuizAdminRepository repo) => _repo = repo;

        public async Task<UpdateAnswerResponse> Handle(UpdateAnswerCommand req, CancellationToken ct)
        {
            var a = await _repo.GetAnswerAsync(req.Id, ct);
            if (a is null)
                return new UpdateAnswerResponse { Success = false, Message = "Answer not found." };

            a.Text = req.Text;
            a.IsCorrect = req.IsCorrect;
            // a.Order = req.Order; // ako uvedeš polje Order u Answer

            var ok = await _repo.UpdateAnswerAsync(a, ct);
            return new UpdateAnswerResponse { Success = ok, Message = ok ? "Answer updated." : "No changes saved." };
        }
    }
}
