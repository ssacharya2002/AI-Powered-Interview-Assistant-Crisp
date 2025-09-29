
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

type StartInterviewScreenProps = {
  onStart: () => void;
};

export function StartInterviewScreen({ onStart }: StartInterviewScreenProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-90px)] w-full">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">All Set!</h2>
          <p className="mb-6 text-gray-600">
            All details collected. Ready to begin your Full Stack Developer
            interview?
          </p>
          <Button className="w-full" size="lg" onClick={onStart}>
            Start Interview Now
          </Button>
        </Card>
      </div>
    </div>
  );
}