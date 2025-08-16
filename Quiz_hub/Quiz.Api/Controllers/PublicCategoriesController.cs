using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quiz.Infrastructure.Data;

namespace Quiz.Api.Controllers
{
    // Namjerno eksplicitna ruta da ne sudari sa Admin/CategoriesController
    [ApiController]
    [Route("api/Categories")]
    [AllowAnonymous] // ili [Authorize] ako želiš da samo logovani vide
    public class PublicCategoriesController : ControllerBase
    {
        private readonly QuizDbContext _ctx;
        public PublicCategoriesController(QuizDbContext ctx) => _ctx = ctx;

        /// <summary>
        /// Vraća kategorije. Po defaultu samo one koje se koriste u nekom kvizu (onlyUsed=true).
        /// /api/Categories?onlyUsed=true|false
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] bool onlyUsed = true, CancellationToken ct = default)
        {
            var query = _ctx.Categories.AsNoTracking();

            if (onlyUsed)
            {
                query = query.Where(c => _ctx.Quizzes.Any(q => q.CategoryId == c.Id));
            }

            var list = await query
                .OrderBy(c => c.Name)
                .Select(c => new { id = c.Id, name = c.Name })
                .ToListAsync(ct);

            return Ok(list);
        }
    }
}
