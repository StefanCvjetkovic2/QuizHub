import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMyResults } from "@/services/resultsService";
import ResultsTable from "@/components/User/Results/ResultsTable";

export default function MyResultsPage() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await listMyResults({ page: 1, pageSize: 50 });
        setItems(res.items ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Moji rezultati</h1>
      <ResultsTable
        items={items}
        loading={loading}
        onView={(row) => nav(`/results/${row.id}`)}
      />
    </div>
  );
}
