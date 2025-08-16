using MediatR;
using QuizHub.Domain.Contracts;
using Quiz.Domain.Constants;
using Quiz.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Quiz.Application.Feature.Admin.Questions.Commands.UpdateQuestion
{
    public class UpdateQuestionCommandHandler : IRequestHandler<UpdateQuestionCommand, UpdateQuestionResponse>
    {
        private readonly IQuizAdminRepository _repo;
        public UpdateQuestionCommandHandler(IQuizAdminRepository repo) => _repo = repo;

        public async Task<UpdateQuestionResponse> Handle(UpdateQuestionCommand req, CancellationToken ct)
        {
            var q = await _repo.GetQuestionAsync(req.Id, ct);
            if (q is null)
                return new UpdateQuestionResponse { Success = false, Message = "Question not found." };

            if (!QuestionTypes.All.Contains(req.Type, StringComparer.Ordinal))
                return new UpdateQuestionResponse { Success = false, Message = $"Unsupported type '{req.Type}'." };

            // 1) meta
            q.Text = req.Text?.Trim() ?? string.Empty;
            q.Type = req.Type;
            q.Order = req.Order;

            var metaOk = await _repo.UpdateQuestionAsync(q, ct);
            if (!metaOk)
                return new UpdateQuestionResponse { Success = false, Message = "No changes saved." };

            // 2) Ako Answers nisu poslati — završavamo
            if (req.Answers is null)
                return new UpdateQuestionResponse { Success = true, Message = "Question updated." };

            // 3) Normalizuj novi set odgovora po tipu
            var normalized = NormalizeAnswers(req.Type, req.Answers);

            // 4) Obriši stare odgovore
            if (q.Answers != null && q.Answers.Count > 0)
            {
                foreach (var old in q.Answers.ToList())
                    await _repo.DeleteAnswerAsync(old.Id, ct);
            }

            // 5) Upisi nove odgovore
            foreach (var (text, isCorrect) in normalized)
            {
                var a = new Answer
                {
                    Id = Guid.NewGuid().ToString(),
                    QuestionId = q.Id,
                    Text = text,
                    IsCorrect = isCorrect
                };
                await _repo.AddAnswerAsync(a, ct);
            }

            return new UpdateQuestionResponse { Success = true, Message = "Question + answers updated." };
        }

        private static List<(string Text, bool IsCorrect)> NormalizeAnswers(string type, List<AnswerUpsertDto> input)
        {
            var list = new List<(string Text, bool IsCorrect)>();

            if (type == QuestionTypes.Single || type == QuestionTypes.Multiple)
            {
                foreach (var a in input.Where(a => !string.IsNullOrWhiteSpace(a.Text)))
                    list.Add((a.Text.Trim(), a.IsCorrect));
                return list;
            }

            if (type == QuestionTypes.TrueFalse)
            {
                if (input.Count == 0)
                {
                    list.Add(("Tačno", true));
                    list.Add(("Netačno", false));
                }
                else if (input.Count == 2)
                {
                    var a = input[0]; var b = input[1];
                    list.Add((string.IsNullOrWhiteSpace(a.Text) ? "Tačno" : a.Text.Trim(), a.IsCorrect));
                    list.Add((string.IsNullOrWhiteSpace(b.Text) ? "Netačno" : b.Text.Trim(), b.IsCorrect));
                }
                else
                {
                    list.Add(("Tačno", true));
                    list.Add(("Netačno", false));
                }
                return list;
            }

            if (type == QuestionTypes.FillIn)
            {
                foreach (var a in input.Where(a => !string.IsNullOrWhiteSpace(a.Text)))
                    list.Add((a.Text.Trim(), true)); // svaki uneseni je tačan
                return list;
            }

            return list;
        }
    }
}
