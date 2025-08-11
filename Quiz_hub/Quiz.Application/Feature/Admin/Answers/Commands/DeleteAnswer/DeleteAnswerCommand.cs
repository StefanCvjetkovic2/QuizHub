using MediatR;

namespace Quiz.Application.Feature.Admin.Answers.Commands.DeleteAnswer
{
    public class DeleteAnswerCommand : IRequest<DeleteAnswerResponse>
    {
        public string Id { get; set; } = default!;
    }

    public class DeleteAnswerResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
