using MediatR;
using System.Collections.Generic;

namespace Quiz.Application.Feature.Admin.Quizzes.Commands.CreateQuiz
{
    public class CreateQuizCommand : IRequest<CreateQuizResponse>
    {
        public string Title { get; set; } = default!;
        public int CategoryId { get; set; } = default!;
        public string? Description { get; set; }
        public int TimeLimitSeconds { get; set; }
        public int Difficulty { get; set; }
        public string CreatedByUserId { get; set; } = default!; // iz tokena ili ručno

        // NOVO: pitanja/opcije
        public IList<CreateQuestionDto> Questions { get; set; } = new List<CreateQuestionDto>();
    }

    public class CreateQuestionDto
    {
        public string Text { get; set; } = default!;
        // "SingleChoice" | "MultipleChoice" | "TrueFalse" | "FillInTheBlank"
        public string Type { get; set; } = default!;
        public int Order { get; set; } = 0;

        // Za Single/Multiple/TrueFalse
        public IList<CreateOptionDto>? Options { get; set; }

        // Za FillInTheBlank
        public IList<string>? AcceptedAnswers { get; set; }
    }

    public class CreateOptionDto
    {
        public string Text { get; set; } = default!;
        public bool IsCorrect { get; set; }
    }

    public class CreateQuizResponse
    {
        public bool Success { get; set; }
        public string? QuizId { get; set; }
        public string Message { get; set; } = "";
    }
}
