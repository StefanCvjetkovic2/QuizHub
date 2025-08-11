using FluentValidation;

namespace Quiz.Application.Feature.Admin.Quizzes.Commands.DeleteQuiz
{
    public class DeleteQuizCommandValidator : AbstractValidator<DeleteQuizCommand>
    {
        public DeleteQuizCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
