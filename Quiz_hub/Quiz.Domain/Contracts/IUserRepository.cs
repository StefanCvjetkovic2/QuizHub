using Quiz.Domain.Entities;

namespace QuizHub.Domain.Contracts
{
    public interface IUserRepository
    {
        Task<bool> AddAsync(User user, CancellationToken cancellationToken);
        Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken);
        Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken);
        Task<bool> UsernameExistsAsync(string username, CancellationToken cancellationToken);
        Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken);

        //Za login
        Task<User?> GetByUsernameOrEmailAsync(string usernameOrEmail, CancellationToken ct);
    }
}

