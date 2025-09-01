import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicQuizDetail } from "@/services/quizPublicService";
import { submitQuiz, getResultDetails } from "@/services/resultsService";
import { normalizeType } from "@/models/quizModels";

import QuizPlayHeader from "@/components/User/Play/QuizPlayHeader";
import QuizProgress from "@/components/User/Play/QuizProgress";
import QuizQuestionCard from "@/components/User/Play/QuizQuestionCard";
import QuizNavButtons from "@/components/User/Play/QuizNavButtons";
import QuizJumpList from "@/components/User/Play/QuizJumpList";

export default function QuizPlayPage() {
  const { quizId } = useParams();
  const nav = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qid]: { type, selectedIds:Set, text } }

  // najnovije stanje za auto-submit
  const answersRef = useRef({});
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // tajmer
  const [remaining, setRemaining] = useState(null);
  const elapsedRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const qd = await getPublicQuizDetail(quizId);
        setQuiz(qd);
        const limit = Number.parseInt(qd.timeLimitSeconds, 10) || 0;
        setRemaining(limit > 0 ? limit : null);

        const init = {};
        for (const q of qd.questions) {
          init[q.id] = { type: normalizeType(q.type), selectedIds: new Set(), text: "" };
        }
        setAnswers(init);
      } catch (e) {
        setErr(e?.response?.data?.message || e.message || "Neuspješno učitavanje kviza.");
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  useEffect(() => {
    if (!quiz) return;
    const limit = Number.parseInt(quiz.timeLimitSeconds, 10) || 0;
    if (limit <= 0) return;

    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        elapsedRef.current += 1;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.id]);

  const q = useMemo(() => quiz?.questions?.[idx] ?? null, [quiz, idx]);

  // mutatori odgovora
  const setRadio = (qid, aid) => {
    setAnswers((prev) => {
      const cur = prev[qid] ?? { type: "single", selectedIds: new Set(), text: "" };
      return { ...prev, [qid]: { ...cur, selectedIds: new Set([String(aid)]), text: "" } };
    });
  };
  const toggleCheckbox = (qid, aid) => {
    setAnswers((prev) => {
      const cur = prev[qid] ?? { type: "multiple", selectedIds: new Set(), text: "" };
      const next = new Set(cur.selectedIds);
      const key = String(aid);
      next.has(key) ? next.delete(key) : next.add(key);
      return { ...prev, [qid]: { ...cur, selectedIds: next, text: "" } };
    });
  };
  const setText = (qid, val) => {
    setAnswers((prev) => {
      const cur = prev[qid] ?? { type: "text", selectedIds: new Set(), text: "" };
      return { ...prev, [qid]: { ...cur, text: val, selectedIds: new Set() } };
    });
  };
  const setTrueFalseText = (qid, val /* "true" | "false" */) => {
    setAnswers((prev) => {
      const cur = prev[qid] ?? { type: "boolean", selectedIds: new Set(), text: "" };
      return { ...prev, [qid]: { ...cur, text: val, selectedIds: new Set() } };
    });
  };

  const go = (delta) => {
    setIdx((i) => {
      const n = (i + delta + (quiz?.questions?.length ?? 0)) % (quiz?.questions?.length ?? 1);
      return n;
    });
  };

  const buildPayload = () => {
    const curAnswers = answersRef.current || {};
    return {
      quizId: quiz.id,
      elapsedSeconds:
        (quiz.timeLimitSeconds && quiz.timeLimitSeconds > 0)
          ? (Number.parseInt(quiz.timeLimitSeconds, 10) - (remaining ?? 0))
          : elapsedRef.current,
      answers: quiz.questions.map((qq) => {
        const t = normalizeType(qq.type);
        const a = curAnswers[qq.id] ?? { type: t, selectedIds: new Set(), text: "" };

        if (t === "text") return { questionId: qq.id, text: a.text ?? "" };

        if (t === "boolean") {
          const ids = Array.from(a.selectedIds ?? []);
          if (ids.length > 0) return { questionId: qq.id, selectedAnswerIds: ids.map(String) };
          if ((a.text ?? "") !== "") return { questionId: qq.id, text: a.text };
          return { questionId: qq.id, selectedAnswerIds: [] };
        }

        return { questionId: qq.id, selectedAnswerIds: Array.from(a.selectedIds ?? []).map(String) };
      }),
    };
  };

  const handleSubmit = async (auto = false) => {
    if (!quiz) return;
    try {
      const payload = buildPayload();
      payload.elapsedSeconds = Math.max(0, Number.parseInt(payload.elapsedSeconds, 10) || 0);

      const res = await submitQuiz(payload);

      let details = [];
      try {
        if (res?.resultId) details = await getResultDetails(res.resultId);
        const inline =
          res?.details ||
          res?.questionResults ||
          res?.perQuestion ||
          res?.items ||
          res?.questions ||
          res?.results ||
          [];
        if (Array.isArray(inline) && inline.length && details.length === 0) details = inline;
      } catch (_) {}

      nav(`/quizzes/${quiz.id}/result`, {
        replace: true,
        state: {
          summary: { ...res, details },
          quizTitle: quiz.title,
          quizQuestions: quiz.questions,
          userAnswers: payload.answers,
        },
      });
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Predaja kviza nije uspjela.";
      if (!auto) alert(msg);
    }
  };

  if (loading) return <div className="muted">Učitavanje kviza…</div>;
  if (err) return <div className="error">{err}</div>;
  if (!quiz) return null;

  const total = quiz.questions.length;
  const progress = total > 0 ? Math.round(((idx + 1) / total) * 100) : 0;

  return (
    <div>
      <QuizPlayHeader
        title={quiz.title}
        timeLimitSeconds={quiz.timeLimitSeconds}
        remaining={remaining}
        onCancel={() => nav("/quizzes")}
        onFinish={() => handleSubmit(false)}
      />

      <QuizProgress percent={progress} />

      {q && (
        <QuizQuestionCard
          question={q}
          index={idx + 1}
          total={total}
          answerState={answers[q.id]}
          setRadio={setRadio}
          toggleCheckbox={toggleCheckbox}
          setText={setText}
          setTrueFalseText={setTrueFalseText}
        />
      )}

      <QuizNavButtons onPrev={() => go(-1)} onNext={() => go(+1)} />

      <QuizJumpList
        questions={quiz.questions}
        currentIndex={idx}
        answersByQid={answers}
        onJump={(i) => setIdx(i)}
      />
    </div>
  );
}
