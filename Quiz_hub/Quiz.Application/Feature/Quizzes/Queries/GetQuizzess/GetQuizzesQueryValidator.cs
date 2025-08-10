using FluentValidation;

namespace Quiz.Application.Feature.Quizzes.Queries.GetQuizzes
{
    public class GetQuizzesQueryValidator : AbstractValidator<GetQuizzesQuery>
    {
        public GetQuizzesQueryValidator()
        {
            RuleFor(x => x.Page).GreaterThan(0);
            RuleFor(x => x.PageSize).GreaterThan(0).LessThanOrEqualTo(100);
            RuleFor(x => x.Difficulty)
                .Must(v => v == null || v >= 0) // pošto ti je Difficulty int, dozvoli 0/1/2
                .WithMessage("Difficulty must be non-negative integer.");
        }
    }
}
