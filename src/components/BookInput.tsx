"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BookInput({
  onAnalysisCompleted,
}: {
  onAnalysisCompleted: (data: any, rawText: string) => void;
}) {
  const [bookId, setBookId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputWarning, setInputWarning] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setBookId(val);
      if (val === "" || /^[1-9]\d*$/.test(val)) {
        setInputWarning("");
      } else {
        setInputWarning("Book ID must start with digits 1–9 (no leading 0s).");
      }
    } else {
      setInputWarning("Only numeric characters (0–9) are allowed.");
    }
  };

  const fetchAndAnalyze = async () => {
    setError("");

    if (!/^[1-9]\d*$/.test(bookId)) {
      setError("Book ID must contain digits 1–9 only. No letters, symbols, or leading 0s.");
      return;
    }

    setLoading(true);
    try {
      const fetchRes = await fetch("/api/fetch-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      const fetchData = await fetchRes.json();
      if (!fetchRes.ok) throw new Error(fetchData.error || "Fetch failed");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: fetchData.content }),
      });

      const analysisData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analysisData.error || "Analysis failed");

      onAnalysisCompleted(analysisData, fetchData.content);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-xl mx-auto my-6">
      <h2 className="text-xl font-semibold mb-4">Enter Project Gutenberg Book ID</h2>
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder="e.g. 1112"
          value={bookId}
          onChange={handleInputChange}
        />
        <Button onClick={fetchAndAnalyze} disabled={loading || !bookId || !!inputWarning}>
          {loading ? "Fetching..." : "Fetch Book"}
        </Button>
      </div>
      {inputWarning && <p className="text-yellow-600 mt-2">{inputWarning}</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </Card>
  );
}
