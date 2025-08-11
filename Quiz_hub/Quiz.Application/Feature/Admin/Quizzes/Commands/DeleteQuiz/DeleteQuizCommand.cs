using MediatR;

namespace Quiz.Application.Feature.Admin.Quizzes.Commands.DeleteQuiz
{
    public class DeleteQuizCommand : IRequest<DeleteQuizResponse>
    {
        public string Id { get; set; } = default!;
    }

    public class DeleteQuizResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
