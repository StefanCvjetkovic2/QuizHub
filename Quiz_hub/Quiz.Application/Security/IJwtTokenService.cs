using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Quiz.Application.Security
{
    public interface IJwtTokenService
    {
        (string token, DateTime expiresAt) CreateToken(string userId, string username, string? email, IEnumerable<string>? roles = null);
    }
}
