using MediatR;

namespace Quiz.Application.Feature.Quizzes.Queries.GetQuizzes
{
    public class GetQuizzesQuery : IRequest<GetQuizzesResponse>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        public string? CategoryId { get; set; }
        public int? Difficulty { get; set; } // 0/1/2 ili kako već koristiš
        public string? Q { get; set; }       // ključna riječ
    }

    public class GetQuizzesResponse
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public IReadOnlyList<QuizListItemDto> Items { get; set; } = Array.Empty<QuizListItemDto>();
    }

    public class QuizListItemDto
    {
        public string Id { get; set; } = default!;
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public int NumberOfQuestions { get; set; }
        public int Difficulty { get; set; }
        public int TimeLimitSeconds { get; set; }
        public string CategoryId { get; set; } = default!;
        public string? CategoryName { get; set; }
    }
}
