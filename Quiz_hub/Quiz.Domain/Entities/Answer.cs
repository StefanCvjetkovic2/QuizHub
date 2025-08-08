using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Quiz.Domain.Entities
{
    public class Answer
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string QuestionId { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; } = false;
        public Question Question { get; set; }
    }
}
