using FluentValidation;
using FluentValidation.Results;
using MediatR;
// alias da OSIGURAŠ da se baca TVOJA, a ne FluentValidation.ValidationException
using ValidationException = Quiz.Application.Exceptions.ValidationException;

namespace Quiz.Application.Behaviours
{
    /// <summary>
    /// MediatR pipeline koji pokreće FluentValidation validatore i u slučaju grešaka
    /// baca našu custom ValidationException (hvata je middleware i vraća 400).
    /// </summary>
    public class ValidationBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;

        public ValidationBehaviour(IEnumerable<IValidator<TRequest>> validators)
            => _validators = validators;

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
        {
            if (_validators.Any())
            {
                var ctx = new ValidationContext<TRequest>(request);
                var results = await Task.WhenAll(_validators.Select(v => v.ValidateAsync(ctx, ct)));
                var failures = results.SelectMany(r => r.Errors).Where(f => f is not null).ToList();

                if (failures.Any())
                    throw new ValidationException(failures); // BACAMO NAŠU custom
            }

            return await next();
        }
    }
}
