using FluentValidation;
using Quiz.Domain.Constants;

namespace Quiz.Application.Feature.Admin.Questions.Commands.UpdateQuestion
{
    public class UpdateQuestionCommandValidator : AbstractValidator<UpdateQuestionCommand>
    {
        public UpdateQuestionCommandValidator()
        {
            RuleFor(x => x.Id).NotEmpty();

            RuleFor(x => x.Text)
                .NotEmpty()
                .MaximumLength(500);

            RuleFor(x => x.Type)
                .Must(t => QuestionTypes.All.Contains(t))
                .WithMessage("Invalid question type.");

            RuleFor(x => x.Order).GreaterThanOrEqualTo(0);

            // Validacije za odgovore se primjenjuju SAMO kada Answers != null
            When(x => x.Answers != null, () =>
            {
                RuleForEach(x => x.Answers!)
                    .ChildRules(a =>
                    {
                        a.RuleFor(z => z.Text).NotEmpty();
                    });

                When(x => x.Type == QuestionTypes.Single, () =>
                {
                    RuleFor(x => x.Answers!)
                        .Must(a => a.Count(z => z.IsCorrect) == 1)
                        .WithMessage("Exactly one correct answer is required.");
                });

                When(x => x.Type == QuestionTypes.Multiple, () =>
                {
                    RuleFor(x => x.Answers!)
                        .Must(a => a.Any(z => z.IsCorrect))
                        .WithMessage("At least one correct answer is required.");
                });

                When(x => x.Type == QuestionTypes.TrueFalse, () =>
                {
                    RuleFor(x => x.Answers!)
                        .Must(a => a.Count == 2)
                        .WithMessage("True/False requires exactly two answers.")
                        .Must(a => a.Count(z => z.IsCorrect) == 1)
                        .WithMessage("True/False requires exactly one correct answer.");
                });

                When(x => x.Type == QuestionTypes.FillIn, () =>
                {
                    RuleFor(x => x.Answers!)
                        .Must(a => a.Any())
                        .WithMessage("Provide at least one accepted value.")
                        .Must(a => a.All(z => z.IsCorrect))
                        .WithMessage("Fill-in answers must be marked as correct.");
                });
            });
        }
    }
}
