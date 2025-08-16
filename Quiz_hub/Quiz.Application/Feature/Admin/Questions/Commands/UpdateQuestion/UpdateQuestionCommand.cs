using MediatR;
using System.Collections.Generic;

namespace Quiz.Application.Feature.Admin.Questions.Commands.UpdateQuestion
{
    public class UpdateQuestionCommand : IRequest<UpdateQuestionResponse>
    {
        // Nullable so MVC doesn't require it in JSON body.
        public string? Id { get; set; }

        public string Text { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // SingleChoice | MultipleChoice | TrueFalse | FillInTheBlank
        public int Order { get; set; }

        // Optional: if null → ne diramo odgovore; ako je setirano → zamijenimo kompletnu listu
        public List<AnswerUpsertDto>? Answers { get; set; }
    }

    public class AnswerUpsertDto
    {
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }

    public class UpdateQuestionResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
