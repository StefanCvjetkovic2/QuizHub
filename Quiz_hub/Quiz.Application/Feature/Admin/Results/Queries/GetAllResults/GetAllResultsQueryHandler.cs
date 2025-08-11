using MediatR;
using QuizHub.Domain.Contracts;

namespace Quiz.Application.Feature.Admin.Results.Queries.GetAllResults
{
    public class GetAllResultsQueryHandler : IRequestHandler<GetAllResultsQuery, GetAllResultsResponse>
    {
        private readonly IResultsRepository _repo;
        public GetAllResultsQueryHandler(IResultsRepository repo) => _repo = repo;

        public async Task<GetAllResultsResponse> Handle(GetAllResultsQuery req, CancellationToken ct)
        {
            var (items, total) = await _repo.GetPagedAsync(req.Page, req.PageSize, req.QuizId, req.UserId, ct);

            var dtos = items.Select(x => new ResultItemDto
            {
                Id = x.Id,
                UserId = x.UserId,
                Username = x.User.Username,
                QuizId = x.QuizId,
                QuizTitle = x.Quiz.Title,
                Score = x.Score,
                Percentage = x.Percentage,
                TimeTakenSeconds = x.TimeTakenSeconds,
                DateTaken = x.DateTaken
            }).ToList();

            return new GetAllResultsResponse
            {
                Page = req.Page,
                PageSize = req.PageSize,
                Total = total,
                Items = dtos
            };
        }
    }
}
