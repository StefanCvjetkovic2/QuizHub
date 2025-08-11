using MediatR;

namespace Quiz.Application.Feature.Admin.Results.Queries.GetAllResults
{
    public class GetAllResultsQuery : IRequest<GetAllResultsResponse>
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? QuizId { get; set; }
        public string? UserId { get; set; }
    }

    public class GetAllResultsResponse
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
        public IReadOnlyList<ResultItemDto> Items { get; set; } = Array.Empty<ResultItemDto>();
    }

    public class ResultItemDto
    {
        public string Id { get; set; } = default!;
        public string UserId { get; set; } = default!;
        public string Username { get; set; } = default!;
        public string QuizId { get; set; } = default!;
        public string QuizTitle { get; set; } = default!;
        public int Score { get; set; }
        public float Percentage { get; set; }
        public int TimeTakenSeconds { get; set; }
        public DateTime DateTaken { get; set; }
    }
}
