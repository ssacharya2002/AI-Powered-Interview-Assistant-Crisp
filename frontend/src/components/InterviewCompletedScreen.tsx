import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

type InterviewCompletedScreenProps = {
  finalScore: number | null;
  recommendation: string | null;
};

export function InterviewCompletedScreen({
  finalScore,
  recommendation,
}: InterviewCompletedScreenProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-90px)] w-full bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Thank You!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Your interview has been completed successfully.
          </p>

          {finalScore !== null && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Your Final Score</p>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {finalScore}/60
              </div>
              <div className="text-sm text-gray-500">
                Recommendation:{" "}
                <span className="font-semibold capitalize">
                  {recommendation?.replace("-", " ")}
                </span>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500">
            We appreciate your time and effort. Results have been saved.
          </p>
        </Card>
      </div>
    </div>
  );
}