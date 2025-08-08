using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Quiz.Domain.Entities
{
    public class Question
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string QuizId { get; set; } = string.Empty;    // FK na Quiz
        public string Text { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;      // "SingleChoice", "MultipleChoice", "TrueFalse", "FillInTheBlank"
        public int Order { get; set; } = 0;
        public Quiz Quiz { get; set; }
        public List<Answer> Answers { get; set; } = new();
        public List<UserAnswer> UserAnswers { get; set; } = new();
    }
}
