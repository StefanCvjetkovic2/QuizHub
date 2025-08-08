using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Quiz.Domain.Entities
{
    public class Quiz
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Title { get; set; } = string.Empty;
        public string CategoryId { get; set; } = string.Empty;  // FK na Category
        public string? Description { get; set; }
        public int TimeLimitSeconds { get; set; }
        public int Difficulty { get; set; }   // možeš kasnije prebaciti u enum
        public string CreatedByUserId { get; set; } = string.Empty;  // FK na User
        public User CreatedByUser { get; set; }
        public Category Category { get; set; }
        public List<Question> Questions { get; set; } = new();
        public List<QuizResult> QuizResults { get; set; } = new();
    }
}
