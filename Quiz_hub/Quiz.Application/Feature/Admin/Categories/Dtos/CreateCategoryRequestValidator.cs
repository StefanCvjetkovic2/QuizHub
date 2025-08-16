using FluentValidation;
using QuizHub.Domain.Contracts;

namespace Quiz.Application.Feature.Admin.Categories.Commands
{
    public class UpdateCategoryRequestValidator : AbstractValidator<UpdateCategoryRequest>
    {
        public UpdateCategoryRequestValidator(ICategoryRepository repo)
        {
            RuleFor(x => x.Id)
                .GreaterThan(0);

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Naziv kategorije je obavezan.")
                .MaximumLength(100)
                .MustAsync(async (model, name, ct) =>
                    !await repo.IsNameTakenAsync(name, model.Id, ct))
                .WithMessage("Kategorija sa istim nazivom već postoji.");
        }
    }
}
