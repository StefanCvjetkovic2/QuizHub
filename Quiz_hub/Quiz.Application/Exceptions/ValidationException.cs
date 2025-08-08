using System;
using System.Collections.Generic;
using System.Linq;
using FluentValidation.Results;

namespace Quiz.Application.Exceptions
{
    /// <summary>
    /// Custom validation exception koju hvata ExceptionHandlingMiddleware i mapira na 400.
    /// </summary>
    public class ValidationException : Exception
    {
        public IDictionary<string, string[]> Errors { get; }

        public ValidationException(IEnumerable<ValidationFailure> failures)
            : base("Validation failed.")
        {
            Errors = failures
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).Distinct().ToArray()
                );
        }
    }
}
