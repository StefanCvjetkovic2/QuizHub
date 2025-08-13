using MediatR;
using Quiz.Domain.Contracts;

namespace Quiz.Application.Feature.Quizzes.Queries.GetQuizzes
{
    public class GetQuizzesQueryHandler : IRequestHandler<GetQuizzesQuery, GetQuizzesResponse>
    {
        private readonly IQuizRepository _repo;
        public GetQuizzesQueryHandler(IQuizRepository repo) => _repo = repo;

        public async Task<GetQuizzesResponse> Handle(GetQuizzesQuery request, CancellationToken ct)
        {
            var pageResult = await _repo.GetPagedAsync(
                page: request.Page,
                pageSize: request.PageSize,
                categoryId: request.CategoryId,
                difficulty: request.Difficulty,
                q: request.Q,
                isPublished: null,   // ili true/false ako uvedeš filter objave
                ct: ct);

            var items = pageResult.Items;
            var total = pageResult.TotalCount;

            var dtos = items.Select(x => new QuizListItemDto
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                NumberOfQuestions = x.Questions?.Count ?? 0,
                Difficulty = x.Difficulty,
                TimeLimitSeconds = x.TimeLimitSeconds,
                CategoryId = x.CategoryId,
                CategoryName = x.Category?.Name
            }).ToList();

            return new GetQuizzesResponse
            {
                Page = request.Page,
                PageSize = request.PageSize,
                TotalCount = total,
                Items = dtos
            };
        }
    }
}
