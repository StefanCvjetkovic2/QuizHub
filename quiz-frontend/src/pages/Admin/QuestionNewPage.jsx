import { useParams } from "react-router-dom";
export default function QuestionNewPage() {
  const { id } = useParams(); 
  return <div className="text-white">[Kreiraj pitanje {id ? `(kviz ${id})` : ""}]</div>;
}
