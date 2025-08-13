using MediatR;
using Quiz.Domain.Contracts;


namespace Quiz.Application.Feature.Quizzes.Queries.GetQuizDetail
{
    public class GetQuizDetailQueryHandler : IRequestHandler<GetQuizDetailQuery, GetQuizDetailResponse?>
    {
        private readonly IQuizRepository _repo;
        public GetQuizDetailQueryHandler(IQuizRepository repo) => _repo = repo;

        public async Task<GetQuizDetailResponse?> Handle(GetQuizDetailQuery request, CancellationToken ct)
        {
            var quiz = await _repo.GetDetailAsync(request.QuizId, ct);
            if (quiz is null) return null;

            var resp = new GetQuizDetailResponse
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description,
                Difficulty = quiz.Difficulty,
                TimeLimitSeconds = quiz.TimeLimitSeconds,
                CategoryId = quiz.CategoryId,
                CategoryName = quiz.Category?.Name,
                Questions = (quiz.Questions ?? new())
                    .OrderBy(q => q.Order)
                    .Select(q => new QuestionDto
                    {
                        Id = q.Id,
                        Type = q.Type,
                        Text = q.Text,
                        Order = q.Order,
                        Answers = (q.Answers ?? new())
                            .Select((a, idx) => new AnswerOptionDto
                            {
                                Id = a.Id,
                                Text = a.Text,
                                Order = idx + 1 // ili a.Order ako imaš polje
                            })
                            .OrderBy(a => a.Order)
                            .ToList()
                    })
                    .ToList()
            };

            return resp;
        }
    }
}
