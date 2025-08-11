using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizHub.Domain.Contracts;
using Quiz.Domain.Entities;
using Quiz.Application.Feature.Admin.Categories.Commands;

namespace Quiz.Api.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Policy = "Admin")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository _repo;
        public CategoriesController(ICategoryRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
            => Ok(await _repo.GetAllAsync(ct));

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request, CancellationToken ct)
        {
            var category = new Category
            {
                Name = request.Name
            };

            var created = await _repo.CreateAsync(category, ct);
            return created ? Ok(category) : BadRequest();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryRequest request, CancellationToken ct)
        {
            if (id != request.Id)
                return BadRequest("Id mismatch.");

            var category = new Category
            {
                Id = request.Id,
                Name = request.Name
            };

            var updated = await _repo.UpdateAsync(category, ct);
            return updated ? Ok(category) : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
            => (await _repo.DeleteAsync(id, ct)) ? NoContent() : NotFound();
    }
}
