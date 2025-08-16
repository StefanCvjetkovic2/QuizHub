using FluentValidation;

namespace Quiz.Application.Feature.Admin.Quizzes.Commands.UpdateQuiz
{
    public class UpdateQuizCommandValidator : AbstractValidator<UpdateQuizCommand>
    {
        public UpdateQuizCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
            RuleFor(x => x.CategoryId).GreaterThan(0);
            RuleFor(x => x.TimeLimitSeconds).GreaterThan(0);
            RuleFor(x => x.Difficulty).GreaterThanOrEqualTo(0);
        }
    }
}