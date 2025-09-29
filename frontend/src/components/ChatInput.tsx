import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

type ChatInputProps = {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isSubmittingAnswer: boolean;
  isLoadingQuestion: boolean;
  hasCurrentQuestion: boolean;
};

export function ChatInput({
  inputValue,
  onInputChange,
  onSubmit,
  isSubmittingAnswer,
  isLoadingQuestion,
  hasCurrentQuestion,
}: ChatInputProps) {
  const getPlaceholder = () => {
    if (isLoadingQuestion && !hasCurrentQuestion) {
      return "Loading next question...";
    }
    if (!hasCurrentQuestion) {
      return "Waiting for next question...";
    }
    return "Type your answer here...";
  };

  const isDisabled =
    isSubmittingAnswer || isLoadingQuestion || !hasCurrentQuestion;

  return (
    <div className="bg-white border-t px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <Textarea
          className="flex-1 resize-none"
          placeholder={getPlaceholder()}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          disabled={isDisabled}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        <Button
          onClick={onSubmit}
          disabled={!hasCurrentQuestion || !inputValue.trim() || isDisabled}
          size="lg"
        >
          {isSubmittingAnswer ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Submit
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">
        Press Ctrl+Enter to submit
      </p>
    </div>
  );
}