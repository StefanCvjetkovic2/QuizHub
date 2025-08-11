using FluentValidation;

namespace Quiz.Application.Feature.Admin.Answers.Commands.AddAnswer
{
    public class AddAnswerCommandValidator : AbstractValidator<AddAnswerCommand>
    {
        public AddAnswerCommandValidator()
        {
            RuleFor(x => x.QuestionId).NotEmpty();
            RuleFor(x => x.Text).NotEmpty().MaximumLength(1000);
            RuleFor(x => x.Order).GreaterThanOrEqualTo(0);
        }
    }
}
