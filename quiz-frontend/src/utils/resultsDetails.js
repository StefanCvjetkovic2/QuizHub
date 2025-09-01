// Konstrukcija mape: qid -> { correct, correctIds:Set<string>, correctTexts:string[], userIds:Set<string>, userText:string }
export function buildDetailsByQid(summary) {
  const list =
    summary?.details ??
    summary?.questionResults ??
    summary?.perQuestion ??
    summary?.items ??
    summary?.questions ??
    summary?.results ??
    [];

  const map = new Map();
  for (const d of list) {
    const qid = String(d?.questionId ?? d?.qid ?? d?.id ?? "");
    if (!qid) continue;

    map.set(qid, {
      correct: !!(d?.isCorrect ?? d?.correct ?? d?.tacan ?? d?.tacno),
      correctIds: new Set(
        (d?.correctAnswerIds ?? d?.correctIds ?? []).map((x) => String(x))
      ),
      correctTexts: Array.isArray(d?.correctAnswerTexts ?? d?.correctTexts)
        ? (d?.correctAnswerTexts ?? d?.correctTexts).filter(Boolean)
        : (d?.correctText ? [d.correctText] : []),
      userIds: new Set(
        (d?.userSelectedAnswerIds ?? d?.userIds ?? []).map((x) => String(x))
      ),
      userText: d?.userText ?? "",
    });
  }
  return map;
}
