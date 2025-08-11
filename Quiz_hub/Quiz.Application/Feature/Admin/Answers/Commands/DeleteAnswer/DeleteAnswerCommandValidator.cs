using FluentValidation;

namespace Quiz.Application.Feature.Admin.Answers.Commands.DeleteAnswer
{
    public class DeleteAnswerCommandValidator : AbstractValidator<DeleteAnswerCommand>
    {
        public DeleteAnswerCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
