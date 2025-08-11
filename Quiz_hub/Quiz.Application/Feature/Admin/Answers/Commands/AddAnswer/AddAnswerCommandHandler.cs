using MediatR;
using QuizHub.Domain.Contracts;
using Quiz.Domain.Entities;

namespace Quiz.Application.Feature.Admin.Answers.Commands.AddAnswer
{
    public class AddAnswerCommandHandler : IRequestHandler<AddAnswerCommand, AddAnswerResponse>
    {
        private readonly IQuizAdminRepository _repo;
        public AddAnswerCommandHandler(IQuizAdminRepository repo) => _repo = repo;

        public async Task<AddAnswerResponse> Handle(AddAnswerCommand req, CancellationToken ct)
        {
            // opciono: proveri da li pitanje postoji
            var question = await _repo.GetQuestionAsync(req.QuestionId, ct);
            if (question is null)
                return new AddAnswerResponse { Success = false, Message = "Question not found." };

            var a = new Answer
            {
                Id = Guid.NewGuid().ToString(),
                QuestionId = req.QuestionId,
                Text = req.Text,
                IsCorrect = req.IsCorrect
            };

            var ok = await _repo.AddAnswerAsync(a, ct);
            return new AddAnswerResponse
            {
                Success = ok,
                AnswerId = ok ? a.Id : null,
                Message = ok ? "Answer added." : "Failed to add answer."
            };
        }
    }
}
