
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ResumeInterviewModalProps = {
  onResume: () => void;
  onStartFresh: () => void;
};

export function ResumeInterviewModal({
  onResume,
  onStartFresh,
}: ResumeInterviewModalProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-90px)] w-full bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold ">Welcome back</h2>
          <h2 className="font-bold  text-gray-600">Resume Interview?</h2>
          <p className="mb-6 text-gray-600">
            We found an incomplete interview session. Would you like to resume
            where you left off?
          </p>
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={onResume}>
              Yes, Resume Interview
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={onStartFresh}
            >
              No, Start Fresh
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}