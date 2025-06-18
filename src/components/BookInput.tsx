"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, BookOpen, Users, TrendingUp, Sparkles, Clock, Zap } from "lucide-react";

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
    <div className="relative">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI-Powered Literary Analysis</span>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Character Interaction Analyzer
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover the hidden relationships and emotional dynamics within classic literature using advanced AI analysis
        </p>
      </div>

      {/* Input Section */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <Card className="relative rounded-2xl p-8 border shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Project Gutenberg Book ID</h2>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Enter book ID (e.g., 1342 for Pride and Prejudice)"
                  value={bookId}
                  onChange={handleInputChange}
                  className="pl-12 pr-4 py-4 text-lg rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <Button
                onClick={fetchAndAnalyze}
                disabled={loading || !bookId || !!inputWarning}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing Book...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Zap className="w-5 h-5" />
                    Analyze Character Interactions
                  </div>
                )}
              </Button>
            </div>

            {inputWarning && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">{inputWarning}</p>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Features Preview */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          { icon: Users, title: "Character Analysis", desc: "Deep dive into character relationships and dynamics" },
          { icon: TrendingUp, title: "Sentiment Tracking", desc: "Track emotional arcs throughout the narrative" },
          { icon: Clock, title: "Timeline View", desc: "Visualize interactions across the story timeline" }
        ].map((feature, i) => (
          <Card key={i} className="group p-6 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg">
            <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
              <feature.icon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}