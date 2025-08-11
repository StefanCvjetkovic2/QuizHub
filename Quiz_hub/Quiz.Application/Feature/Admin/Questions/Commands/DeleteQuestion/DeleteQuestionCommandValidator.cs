using FluentValidation;

namespace Quiz.Application.Feature.Admin.Questions.Commands.DeleteQuestion
{
    public class DeleteQuestionCommandValidator : AbstractValidator<DeleteQuestionCommand>
    {
        public DeleteQuestionCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
