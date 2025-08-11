using MediatR;

namespace Quiz.Application.Feature.Admin.Answers.Commands.UpdateAnswer
{
    public class UpdateAnswerCommand : IRequest<UpdateAnswerResponse>
    {
        public string Id { get; set; } = default!;
        public string Text { get; set; } = default!;
        public bool IsCorrect { get; set; }
        public int Order { get; set; } = 0; // ako koristiš
    }

    public class UpdateAnswerResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
