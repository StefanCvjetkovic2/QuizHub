using MediatR;
using Quiz.Domain.Entities;
using Quiz.Domain.Constants;

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

            // Mapiranje pitanja/opcija
            foreach (var q in r.Questions.OrderBy(x => x.Order))
            {
                var question = new Question
                {
                    Id = Guid.NewGuid().ToString(),
                    QuizId = quiz.Id,
                    Text = q.Text,
                    Type = q.Type,
                    Order = q.Order
                };

                if (q.Type == QuestionTypes.Single || q.Type == QuestionTypes.Multiple || q.Type == QuestionTypes.TrueFalse)
                {
                    if (q.Options != null)
                    {
                        foreach (var opt in q.Options)
                        {
                            question.Answers.Add(new Answer
                            {
                                Id = Guid.NewGuid().ToString(),
                                QuestionId = question.Id,
                                Text = opt.Text,
                                IsCorrect = opt.IsCorrect
                            });
                        }
                    }
                }
                else if (q.Type == QuestionTypes.FillIn && q.AcceptedAnswers != null)
                {
                    foreach (var a in q.AcceptedAnswers)
                    {
                        question.Answers.Add(new Answer
                        {
                            Id = Guid.NewGuid().ToString(),
                            QuestionId = question.Id,
                            Text = a.Trim(),
                            IsCorrect = true
                        });
                    }
                }

                quiz.Questions.Add(question);
            }

            var ok = await _repo.CreateQuizAsync(quiz, ct); // ostaje bool po tvojoj signaturi
            return new CreateQuizResponse
            {
                Success = ok,
                QuizId = ok ? quiz.Id : null,
                Message = ok ? "Created." : "Failed."
            };
        }
    }
}
