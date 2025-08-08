using MediatR;
using QuizHub.Domain.Contracts;
using System.IO;

namespace QuizHub.Application.Feature.User.Commands
{
    /// <summary>
    /// Handler za registraciju: koristi BCrypt (salt ugrađen u hash),
    /// profilna slika opciona, FullName opciono.
    /// </summary>
    public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, RegisterUserCommandResponse>
    {
        private readonly IUserRepository _userRepository;

        public RegisterUserCommandHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<RegisterUserCommandResponse> Handle(RegisterUserCommand request, CancellationToken ct)
        {
            // Hash lozinke (BCrypt ima ugrađen salt)
            var hashPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Slika — opciono
            byte[]? imageBytes = null;
            string? contentType = null;
            if (request.ProfilePicture is not null && request.ProfilePicture.Length > 0)
            {
                using var ms = new MemoryStream();
                await request.ProfilePicture.CopyToAsync(ms, ct);
                imageBytes = ms.ToArray();
                contentType = request.ProfilePicture.ContentType;
            }

            // DTO → Entity (po specifikaciji DTO ≠ DB model)
            var user = new Quiz.Domain.Entities.User
            {
                Id = Guid.NewGuid().ToString(),
                Username = request.Username,
                Email = request.Email,
                PasswordHash = hashPassword,
                FullName = request.FullName ?? string.Empty,
                ProfilePicture = imageBytes,
                ProfilePictureContentType = contentType
            };

            var added = await _userRepository.AddAsync(user, ct);

            if (!added)
            {
                return new RegisterUserCommandResponse
                {
                    Success = false,
                    Message = "Failed to create user."
                };
            }

            return new RegisterUserCommandResponse
            {
                Success = true,
                Message = "User registered successfully."
            };
        }
    }
}
