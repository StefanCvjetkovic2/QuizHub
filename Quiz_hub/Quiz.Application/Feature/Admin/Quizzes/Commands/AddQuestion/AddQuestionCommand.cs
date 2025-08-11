using MediatR;

namespace Quiz.Application.Feature.Admin.Questions.Commands.AddQuestion
{
    public class AddQuestionCommand : IRequest<AddQuestionResponse>
    {
        public string QuizId { get; set; } = default!;
        public string Text { get; set; } = default!;
        public string Type { get; set; } = default!; // "SingleChoice" | "MultipleChoice" | "TrueFalse" | "FillInTheBlank"
        public int Order { get; set; }
        public List<AddAnswerDto> Answers { get; set; } = new();
    }
    public class AddAnswerDto { public string Text { get; set; } = default!; public bool IsCorrect { get; set; } }
    public class AddQuestionResponse { public bool Success { get; set; } public string? QuestionId { get; set; } }
}
