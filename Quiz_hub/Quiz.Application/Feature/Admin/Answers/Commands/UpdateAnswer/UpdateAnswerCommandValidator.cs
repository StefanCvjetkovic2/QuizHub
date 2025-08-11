using FluentValidation;

namespace Quiz.Application.Feature.Admin.Answers.Commands.UpdateAnswer
{
    public class UpdateAnswerCommandValidator : AbstractValidator<UpdateAnswerCommand>
    {
        public UpdateAnswerCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Text).NotEmpty().MaximumLength(1000);
        }
    }
}
