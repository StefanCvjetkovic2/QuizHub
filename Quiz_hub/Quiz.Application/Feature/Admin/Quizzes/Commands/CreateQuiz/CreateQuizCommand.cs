using MediatR;

namespace Quiz.Application.Feature.Admin.Quizzes.Commands.CreateQuiz
{
    public class CreateQuizCommand : IRequest<CreateQuizResponse>
    {
        public string Title { get; set; } = default!;
        public int CategoryId { get; set; } = default!;
        public string? Description { get; set; }
        public int TimeLimitSeconds { get; set; }
        public int Difficulty { get; set; }
        public string CreatedByUserId { get; set; } = default!; // za sada ručno ili iz tokena u kontroleru
    }
    public class CreateQuizResponse { public bool Success { get; set; } public string? QuizId { get; set; } public string Message { get; set; } = ""; }
}
