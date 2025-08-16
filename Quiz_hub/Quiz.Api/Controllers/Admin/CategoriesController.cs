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

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var c = await _repo.GetByIdAsync(id, ct);
            return c is null ? NotFound() : Ok(c);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request, CancellationToken ct)
        {
            // validatori će već odbiti prazan ili duplikat naziv
            var category = new Category { Name = request.Name.Trim() };

            var created = await _repo.CreateAsync(category, ct);
            if (!created) return BadRequest(new { message = "Kreiranje nije uspjelo." });

            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryRequest request, CancellationToken ct)
        {
            if (id != request.Id)
                return BadRequest(new { message = "Id mismatch." });

            var exists = await _repo.ExistsAsync(id, ct);
            if (!exists) return NotFound();

            var category = new Category
            {
                Id = request.Id,
                Name = request.Name.Trim()
            };

            var updated = await _repo.UpdateAsync(category, ct);
            return updated ? Ok(category) : BadRequest(new { message = "Ažuriranje nije uspjelo." });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            // 404 ako ne postoji
            if (!await _repo.ExistsAsync(id, ct))
                return NotFound();

            // 409 Conflict ako je u upotrebi (ima kvizova)
            if (await _repo.IsInUseAsync(id, ct))
                return Conflict(new { message = "Kategorija se koristi u jednom ili više kvizova i ne može se obrisati." });

            var ok = await _repo.DeleteAsync(id, ct);
            return ok ? NoContent() : BadRequest(new { message = "Brisanje nije uspjelo." });
        }
    }
}
