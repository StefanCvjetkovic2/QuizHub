using FluentValidation;
using QuizHub.Domain.Contracts;

namespace QuizHub.Application.Feature.User.Commands
{
    /// <summary>
    /// Minimalna validacija po specifikaciji:
    /// - validan email,
    /// - minimalna dužina lozinke,
    /// - jedinstveno korisničko ime.
    /// Ostala polja su opciona i nisu predmet validacije.
    /// </summary>
    public class RegisterUserCommandValidator : AbstractValidator<RegisterUserCommand>
    {
        public RegisterUserCommandValidator(IUserRepository userRepository)
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username is required.")
                .MinimumLength(3).WithMessage("Username must be at least 3 characters long.")
                .MustAsync(async (username, cancellation) =>
                    !await userRepository.UsernameExistsAsync(username, cancellation))
                    .When(x => !string.IsNullOrWhiteSpace(x.Username))
                .WithMessage("Username already exists.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters long.");

            // FullName i ProfilePicture su opcioni (nema pravila).
        }
    }
}
