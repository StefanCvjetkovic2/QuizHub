using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Quiz.Domain.Entities;
using QuizHub.Domain.Contracts;
using Quiz.Infrastructure.Data; 

namespace QuizHub.Infrastructure.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly QuizDbContext _context; 

        public UserRepository(QuizDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AddAsync(User user, CancellationToken cancellationToken)
        {
            await _context.Users.AddAsync(user, cancellationToken);
            return await _context.SaveChangesAsync(cancellationToken) > 0;
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        }

        public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username, cancellationToken);
        }

        public async Task<bool> UsernameExistsAsync(string username, CancellationToken cancellationToken)
        {
            return await _context.Users.AnyAsync(u => u.Username == username, cancellationToken);
        }

        public async Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken)
        {
            return await _context.Users.AnyAsync(u => u.Email == email, cancellationToken);
        }

        public Task<User?> GetByUsernameOrEmailAsync(string usernameOrEmail, CancellationToken ct)
           => _context.Users.FirstOrDefaultAsync(
               u => u.Username == usernameOrEmail || u.Email == usernameOrEmail, ct);
    }
}
