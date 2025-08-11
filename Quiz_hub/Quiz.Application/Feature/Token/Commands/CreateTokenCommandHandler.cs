using MediatR;
using Quiz.Application.Security;
using QuizHub.Domain.Contracts;

namespace Quiz.Application.Feature.Token.Commands
{
    public class CreateTokenCommandHandler : IRequestHandler<CreateTokenCommand, CreateTokenResponse>
    {
        private readonly IUserRepository _users;
        private readonly IJwtTokenService _jwt;

        public CreateTokenCommandHandler(IUserRepository users, IJwtTokenService jwt)
        {
            _users = users;
            _jwt = jwt;
        }

        public async Task<CreateTokenResponse> Handle(CreateTokenCommand request, CancellationToken ct)
        {
            // malo očistimo input
            var identifier = request.UsernameOrEmail?.Trim();
            if (string.IsNullOrWhiteSpace(identifier) || string.IsNullOrWhiteSpace(request.Password))
                return new CreateTokenResponse { Success = false, Message = "Invalid credentials." };

            var user = await _users.GetByUsernameOrEmailAsync(identifier, ct);
            if (user is null)
                return new CreateTokenResponse { Success = false, Message = "Invalid credentials." };

            var ok = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!ok)
                return new CreateTokenResponse { Success = false, Message = "Invalid credentials." };

            // ➜ DODATO: role u tokenu (Admin policy koristi ClaimTypes.Role == "Admin")
            List<string>? roles = null;
            if (user.IsAdmin)
                roles = new List<string> { "Admin" };

            var (token, expires) = _jwt.CreateToken(user.Id, user.Username, user.Email, roles);

            return new CreateTokenResponse
            {
                Success = true,
                Message = "Login successful.",
                Token = token,
                ExpiresAtUtc = expires,
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email
            };
        }
    }
}
