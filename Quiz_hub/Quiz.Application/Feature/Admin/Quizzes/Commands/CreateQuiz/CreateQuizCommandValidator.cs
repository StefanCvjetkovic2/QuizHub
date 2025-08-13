using FluentValidation;
using System.Linq;
using Quiz.Domain.Constants;

namespace Quiz.Application.Feature.Admin.Quizzes.Commands.CreateQuiz
{
    public class CreateQuizCommandValidator : AbstractValidator<CreateQuizCommand>
    {
        public CreateQuizCommandValidator()
        {
            RuleFor(x => x.Title).NotEmpty().Length(3, 100);
            RuleFor(x => x.CategoryId).GreaterThan(0);
            RuleFor(x => x.TimeLimitSeconds).GreaterThan(0);
            RuleFor(x => x.Difficulty).GreaterThan(0);
            RuleFor(x => x.Questions).NotEmpty();

            RuleForEach(x => x.Questions).SetValidator(new CreateQuestionDtoValidator());
        }
    }

    public class CreateQuestionDtoValidator : AbstractValidator<CreateQuestionDto>
    {
        public CreateQuestionDtoValidator()
        {
            RuleFor(q => q.Text).NotEmpty();
            RuleFor(q => q.Type)
                .NotEmpty()
                .Must(t => QuestionTypes.All.Contains(t))
                .WithMessage($"Type must be one of: {string.Join(", ", QuestionTypes.All)}");

            // SINGLE
            When(q => q.Type == QuestionTypes.Single, () =>
            {
                RuleFor(q => q.Options).NotNull().Must(o => o!.Count >= 2)
                    .WithMessage("SingleChoice requires at least 2 options.");
                RuleFor(q => q.Options!.Count(o => o.IsCorrect)).Equal(1)
                    .WithMessage("SingleChoice must have exactly 1 correct option.");
            });

            // MULTIPLE
            When(q => q.Type == QuestionTypes.Multiple, () =>
            {
                RuleFor(q => q.Options).NotNull().Must(o => o!.Count >= 2)
                    .WithMessage("MultipleChoice requires at least 2 options.");
                RuleFor(q => q.Options!.Count(o => o.IsCorrect)).GreaterThanOrEqualTo(2)
                    .WithMessage("MultipleChoice requires at least 2 correct options.");
            });

            // TRUE/FALSE
            When(q => q.Type == QuestionTypes.TrueFalse, () =>
            {
                RuleFor(q => q.Options).NotNull().Must(o => o!.Count == 2)
                    .WithMessage("TrueFalse requires exactly 2 options: \"Tačno\" and \"Netačno\".");
                RuleFor(q => q.Options!.Count(o => o.IsCorrect)).Equal(1)
                    .WithMessage("TrueFalse must have exactly 1 correct option.");
                RuleForEach(q => q.Options!)
                    .ChildRules(opt => opt.RuleFor(x => x.Text).Must(t =>
                        t.Equals("Tačno", System.StringComparison.OrdinalIgnoreCase) ||
                        t.Equals("Netačno", System.StringComparison.OrdinalIgnoreCase)
                    ).WithMessage("TrueFalse options must be \"Tačno\" and \"Netačno\"."));
            });

            // FILL-IN
            When(q => q.Type == QuestionTypes.FillIn, () =>
            {
                RuleFor(q => q.AcceptedAnswers).NotNull().Must(a => a!.Count >= 1)
                    .WithMessage("FillInTheBlank requires at least 1 accepted answer.");
            });
        }
    }
}
