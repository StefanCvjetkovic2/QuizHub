import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listCategories } from "../../services/categoryService";
import { createQuiz } from "../../services/quizService";
import QuizForm from "../../components/Admin/Quizzes/QuizForm";

export default function QuizNewPage() {
  const nav = useNavigate();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverErr, setServerErr] = useState("");
  const [fieldErr, setFieldErr] = useState({});

  useEffect(() => {
    (async () => { try { setCategories(await listCategories()); } catch {} })();
  }, []);

  const handleSubmit = async (form) => {
    setServerErr(""); setFieldErr({});
    try {
      setSubmitting(true);
      await createQuiz(form);
      nav("/admin", { replace: true });
    } catch (e2) {
      const data = e2?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const fe = {};
        for (const er of data.errors) {
          const k = (er.name || "").toLowerCase();
          const map = {
            title: "naziv", name: "naziv", naziv: "naziv",
            description: "opis", opis: "opis",
            categoryid: "categoryId",
            difficulty: "difficulty", tezina: "difficulty",
            timelimitseconds: "timeLimitSeconds", vremenskoogranicenje: "timeLimitSeconds",
          };
          const key = map[k] || k;
          fe[key] = er.reason || er.message || "Neispravna vrijednost.";
        }
        setFieldErr(fe);
        setServerErr(data.message || "");
      } else if (data?.errors && typeof data.errors === "object") {
        const fe = {};
        for (const [k, arr] of Object.entries(data.errors)) {
          const map = {
            title: "naziv", name: "naziv", naziv: "naziv",
            description: "opis",
            categoryid: "categoryId",
            difficulty: "difficulty", tezina: "difficulty",
            timelimitseconds: "timeLimitSeconds", vremenskoogranicenje: "timeLimitSeconds",
          };
          const outKey = map[k.toLowerCase()] || k;
          fe[outKey] = Array.isArray(arr) ? arr.join(" ") : String(arr);
        }
        setFieldErr(fe);
        setServerErr(data.title || data.message || "");
      } else {
        setServerErr(data?.message || data?.detail || e2?.message || "Kreiranje nije uspjelo.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{fontSize:22, marginBottom:10, fontWeight:800}}>Kreiraj kviz</h2>
      <QuizForm
        categories={categories}
        submitting={submitting}
        serverError={serverErr}
        fieldErrors={fieldErr}
        onSubmit={handleSubmit}
        onCancel={() => nav("/admin")}
      />
    </div>
  );
}
