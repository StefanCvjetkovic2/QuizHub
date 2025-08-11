using MediatR;

namespace Quiz.Application.Feature.Admin.Answers.Commands.AddAnswer
{
    public class AddAnswerCommand : IRequest<AddAnswerResponse>
    {
        public string QuestionId { get; set; } = default!;
        public string Text { get; set; } = default!;
        public bool IsCorrect { get; set; }
        public int Order { get; set; } = 0;
    }

    public class AddAnswerResponse
    {
        public bool Success { get; set; }
        public string? AnswerId { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
