import { Clock } from "lucide-react";

type InterviewHeaderProps = {
  questionNumber: number;
  difficulty?: string;
  timeLeftSeconds: number | null;
};

export function InterviewHeader({
  questionNumber,
  difficulty,
  timeLeftSeconds,
}: InterviewHeaderProps) {
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isTimeLow = (timeLeftSeconds ?? 0) <= 10;

  return (
    <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">Question {questionNumber} of 6</p>
        <p className="text-xs text-gray-500">
          {difficulty?.toUpperCase()} difficulty
        </p>
      </div>
      {timeLeftSeconds !== null && (
        <div className="flex items-center gap-2">
          <Clock
            className={`w-5 h-5 ${
              isTimeLow ? "text-red-600" : "text-blue-600"
            }`}
          />
          <span
            className={`text-2xl font-mono font-bold ${
              isTimeLow ? "text-red-600" : "text-blue-600"
            }`}
          >
            {formatTime(timeLeftSeconds)}
          </span>
        </div>
      )}
    </div>
  );
}