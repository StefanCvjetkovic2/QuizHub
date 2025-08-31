import { useParams } from "react-router-dom";
export default function QuestionNewPage() {
  const { id } = useParams(); // opcionalno, ako dolazi iz /quizzes/:id/questions/new
  return <div className="text-white">[Kreiraj pitanje {id ? `(kviz ${id})` : ""}]</div>;
}
