using MediatR;

namespace Quiz.Application.Feature.Admin.Questions.Commands.DeleteQuestion
{
    public class DeleteQuestionCommand : IRequest<DeleteQuestionResponse>
    {
        public string Id { get; set; } = default!;
    }

    public class DeleteQuestionResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
