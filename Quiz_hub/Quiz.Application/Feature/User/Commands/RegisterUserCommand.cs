using MediatR;
using Microsoft.AspNetCore.Http;

namespace QuizHub.Application.Feature.User.Commands
{
    public class RegisterUserCommand : IRequest<RegisterUserCommandResponse>
    {
        public string Username { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        // Po specifikaciji nisu obavezni:
        public string? FullName { get; set; }
        public IFormFile? ProfilePicture { get; set; }
    }

    public class RegisterUserCommandResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
