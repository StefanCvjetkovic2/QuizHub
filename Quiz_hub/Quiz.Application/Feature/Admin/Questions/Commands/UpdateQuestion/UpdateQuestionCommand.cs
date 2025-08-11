using MediatR;

namespace Quiz.Application.Feature.Admin.Questions.Commands.UpdateQuestion
{
    public class UpdateQuestionCommand : IRequest<UpdateQuestionResponse>
    {
        public string Id { get; set; } = default!;
        public string Text { get; set; } = default!;
        public string Type { get; set; } = default!; // "SingleChoice" | "MultipleChoice" | "TrueFalse" | "FillInTheBlank"
        public int Order { get; set; }
    }

    public class UpdateQuestionResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
