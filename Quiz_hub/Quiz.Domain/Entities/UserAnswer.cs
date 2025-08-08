using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Quiz.Domain.Entities
{
    public class UserAnswer
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string QuizResultId { get; set; } = string.Empty;
        public string QuestionId { get; set; } = string.Empty;
        public string AnswerText { get; set; } = string.Empty; // za "SingleChoice" i "MultipleChoice" može biti lista ID-eva, za ostale direktan odgovor
        public QuizResult QuizResult { get; set; }
        public Question Question { get; set; }
    }
}
