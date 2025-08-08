using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Quiz.Domain.Entities
{
    public class QuizResult
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; } = string.Empty;
        public string QuizId { get; set; } = string.Empty;
        public int Score { get; set; }
        public float Percentage { get; set; }
        public int TimeTakenSeconds { get; set; }
        public DateTime DateTaken { get; set; } = DateTime.UtcNow;
        public User User { get; set; }
        public Quiz Quiz { get; set; }
        public List<UserAnswer> UserAnswers { get; set; } = new();
    }
}
