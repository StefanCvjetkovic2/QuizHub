using FluentValidation;

namespace Quiz.Application.Feature.Admin.Questions.Commands.UpdateQuestion
{
    public class UpdateQuestionCommandValidator : AbstractValidator<UpdateQuestionCommand>
    {
        public UpdateQuestionCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Text).NotEmpty().MaximumLength(1000);
            RuleFor(x => x.Type).NotEmpty().MaximumLength(40);
            RuleFor(x => x.Order).GreaterThanOrEqualTo(0);
        }
    }
}
