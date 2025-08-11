using MediatR;
using QuizHub.Domain.Contracts;
using Quiz.Domain.Entities;

namespace Quiz.Application.Feature.Admin.Questions.Commands.AddQuestion
{
    public class AddQuestionCommandHandler : IRequestHandler<AddQuestionCommand, AddQuestionResponse>
    {
        private readonly IQuizAdminRepository _repo;
        public AddQuestionCommandHandler(IQuizAdminRepository repo) => _repo = repo;

        public async Task<AddQuestionResponse> Handle(AddQuestionCommand r, CancellationToken ct)
        {
            var q = new Question
            {
                Id = Guid.NewGuid().ToString(),
                QuizId = r.QuizId,
                Text = r.Text,
                Type = r.Type,
                Order = r.Order,
                Answers = r.Answers.Select(a => new Answer
                {
                    Id = Guid.NewGuid().ToString(),
                    Text = a.Text,
                    IsCorrect = a.IsCorrect
                }).ToList()
            };
            var ok = await _repo.AddQuestionAsync(q, ct);
            return new AddQuestionResponse { Success = ok, QuestionId = ok ? q.Id : null };
        }
    }
}
