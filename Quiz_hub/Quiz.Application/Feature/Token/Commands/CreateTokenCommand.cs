using MediatR;

namespace Quiz.Application.Feature.Token.Commands
{
    // Login payload
    public class CreateTokenCommand : IRequest<CreateTokenResponse>
    {
        public string UsernameOrEmail { get; set; } = default!;
        public string Password { get; set; } = default!;
    }

    public class CreateTokenResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;

        public string? Token { get; set; }
        public DateTime? ExpiresAtUtc { get; set; }

        public string? UserId { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
    }
}
