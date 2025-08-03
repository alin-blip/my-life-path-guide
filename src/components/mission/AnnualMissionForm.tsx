
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

type QuestionBlock = {
  label: string;
  key: string;
};

interface AnnualQuestions {
  headline: string;
  round1: QuestionBlock[];
  round2: QuestionBlock[];
  round3: QuestionBlock[];
  revelation: QuestionBlock[];
  lessons: QuestionBlock[];
  missionParts: QuestionBlock[];
  result: QuestionBlock[];
}

interface Props {
  questions: AnnualQuestions;
  initialData?: Record<string, string>;
  initialCreatedAt?: string;
  initialUpdatedAt?: string;
  initialPeriod?: string;
  onSave?: (data: Record<string, string>, period: string, createdAt: string, updatedAt: string) => void;
}

export const AnnualMissionForm: React.FC<Props> = ({
  questions,
  initialData = {},
  initialCreatedAt,
  initialUpdatedAt,
  initialPeriod,
  onSave,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>(initialData);
  const [period, setPeriod] = useState(initialPeriod || "2025-01-01 to 2025-12-31");
  const [createdAt, setCreatedAt] = useState<string>(
    initialCreatedAt ?? new Date().toISOString()
  );
  const [updatedAt, setUpdatedAt] = useState<string>(
    initialUpdatedAt ?? new Date().toISOString()
  );

  const handleChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setUpdatedAt(new Date().toISOString());
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriod(e.target.value);
    setUpdatedAt(new Date().toISOString());
  };

  const handleSave = () => {
    if (onSave) {
      onSave(answers, period, createdAt, updatedAt);
    }
  };

  const formatDateTime = (date: string) => {
    const d = new Date(date);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  return (
    <Card className="bg-slate-900 rounded-xl p-6 text-white max-w-2xl mx-auto space-y-6 shadow-lg">
      <h2 className="font-bold text-xl mb-2">{questions.headline}</h2>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Perioada misiune anuală:</label>
        <input
          type="text"
          value={period}
          onChange={handlePeriodChange}
          className="bg-slate-800 text-white p-2 rounded w-full border-none"
          placeholder="ex: 2025-01-01 to 2025-12-31"
        />
      </div>

      {/* Created/Updated */}
      <div className="flex gap-6 text-gray-400 mb-2 text-sm">
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Creat: {formatDateTime(createdAt)}
        </span>
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4" /> Ultima editare: {formatDateTime(updatedAt)}
        </span>
      </div>

      {/* ROUND 1 */}
      <div>
        <h3 className="font-bold mb-1 mt-5 text-lg">ROUND #1</h3>
        {questions.round1.map((q) => (
          <div key={q.key} className="mb-3">
            <label className="block mb-2">{q.label}</label>
            <textarea
              value={answers[q.key] || ""}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="bg-slate-800 text-white rounded p-2 border-none w-full min-h-[44px]"
            />
          </div>
        ))}
      </div>
      {/* ROUND 2 */}
      <div>
        <h3 className="font-bold mb-1 mt-5 text-lg">ROUND #2</h3>
        {questions.round2.map((q) => (
          <div key={q.key} className="mb-3">
            <label className="block mb-2">{q.label}</label>
            <textarea
              value={answers[q.key] || ""}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="bg-slate-800 text-white rounded p-2 border-none w-full min-h-[44px]"
            />
          </div>
        ))}
      </div>
      {/* ROUND 3 */}
      <div>
        <h3 className="font-bold mb-1 mt-5 text-lg">ROUND #3</h3>
        {questions.round3.map((q) => (
          <div key={q.key} className="mb-3">
            <label className="block mb-2">{q.label}</label>
            <textarea
              value={answers[q.key] || ""}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="bg-slate-800 text-white rounded p-2 border-none w-full min-h-[44px]"
            />
          </div>
        ))}
      </div>

      {/* Revelation */}
      <div>
        <h3 className="font-bold mb-1 mt-5 text-lg">REVELAȚII</h3>
        {questions.revelation.map((q) => (
          <div key={q.key} className="mb-3">
            <label className="block mb-2">{q.label}</label>
            <textarea
              value={answers[q.key] || ""}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="bg-slate-800 text-white rounded p-2 border-none w-full min-h-[44px]"
            />
          </div>
        ))}
      </div>
      {/* Lessons */}
      <div>
        <h3 className="font-bold mb-1 mt-5 text-lg">LECȚII</h3>
        {questions.lessons.map((q) => (
          <div key={q.key} className="mb-3">
            <label className="block mb-2">{q.label}</label>
            <textarea
              value={answers[q.key] || ""}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="bg-slate-800 text-white rounded p-2 border-none w-full min-h-[44px]"
            />
          </div>
        ))}
      </div>
      {/* Mission Parts */}
      <div>
        {questions.missionParts.map((q) => (
          <div key={q.key} className="mb-3">
            <label className="block mb-2">{q.label}</label>
            <textarea
              value={answers[q.key] || ""}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="bg-slate-800 text-white rounded p-2 border-none w-full min-h-[44px]"
            />
          </div>
        ))}
      </div>
      {/* Result Section */}
      <div>
        <h3 className="font-bold mb-1 mt-5 text-lg">REZULTATE</h3>
        {questions.result.map((q) => (
          <div key={q.key} className="mb-3">
            <label className="block mb-2">{q.label}</label>
            <textarea
              value={answers[q.key] || ""}
              onChange={(e) => handleChange(q.key, e.target.value)}
              className="bg-slate-800 text-white rounded p-2 border-none w-full min-h-[44px]"
            />
          </div>
        ))}
      </div>
      {/* Save Button */}
      {onSave && (
        <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-800" onClick={handleSave}>
          Salvează Misiunea Anuală
        </Button>
      )}
    </Card>
  );
};
