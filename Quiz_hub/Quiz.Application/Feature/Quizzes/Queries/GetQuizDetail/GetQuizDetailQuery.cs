using MediatR;

namespace Quiz.Application.Feature.Quizzes.Queries.GetQuizDetail
{
    public class GetQuizDetailQuery : IRequest<GetQuizDetailResponse?>
    {
        public string QuizId { get; set; } = default!;
    }

    public class GetQuizDetailResponse
    {
        public string Id { get; set; } = default!;
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public int Difficulty { get; set; }
        public int TimeLimitSeconds { get; set; }
        public string CategoryId { get; set; } = default!;
        public string? CategoryName { get; set; }

        public IReadOnlyList<QuestionDto> Questions { get; set; } = Array.Empty<QuestionDto>();
    }

    public class QuestionDto
    {
        public string Id { get; set; } = default!;
        public string Type { get; set; } = default!; // "SingleChoice" | "MultipleChoice" | "TrueFalse" | "FillInTheBlank"
        public string Text { get; set; } = default!;
        public int Order { get; set; }
        public IReadOnlyList<AnswerOptionDto> Answers { get; set; } = Array.Empty<AnswerOptionDto>();
    }

    public class AnswerOptionDto
    {
        public string Id { get; set; } = default!;
        public string Text { get; set; } = default!;
        public int Order { get; set; }
        // NEMA IsCorrect – ne otkrivamo tačne odgovore
    }
}
