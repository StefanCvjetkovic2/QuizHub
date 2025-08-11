using MediatR;

namespace Quiz.Application.Feature.Admin.Quizzes.Commands.UpdateQuiz
{
    public class UpdateQuizCommand : IRequest<UpdateQuizResponse>
    {
        public string Id { get; set; } = default!;
        public string Title { get; set; } = default!;
        public int CategoryId { get; set; } = default!;
        public string? Description { get; set; }
        public int TimeLimitSeconds { get; set; }
        public int Difficulty { get; set; }
    }

    public class UpdateQuizResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
