using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quiz.Application.Feature.Admin.Results.Queries.GetAllResults;

namespace Quiz.Api.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Policy = "Admin")]
    public class ResultsController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ResultsController(IMediator mediator) => _mediator = mediator;

        // GET /api/admin/results?page=1&pageSize=20&quizId=&userId=
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetAllResultsQuery query, CancellationToken ct)
        {
            var res = await _mediator.Send(query, ct);
            return Ok(res);
        }
    }
}
