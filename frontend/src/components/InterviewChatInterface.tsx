import { InterviewHeader } from "./InterviewHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import type { Message } from "../lib/types";

type InterviewChatInterfaceProps = {
  candidate: any;
  currentQuestion: any;
  messages: Message[];
  inputValue: string;
  isLoadingQuestion: boolean;
  isSubmittingAnswer: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
};

export function InterviewChatInterface({
  candidate,
  currentQuestion,
  messages,
  inputValue,
  isLoadingQuestion,
  isSubmittingAnswer,
  messagesEndRef,
  onInputChange,
  onSubmit,
}: InterviewChatInterfaceProps) {
  const status = candidate?.status;

  return (
    <div className="flex flex-col h-[calc(100vh-90px)] w-full bg-gray-50">
      {status === "in-progress" && !candidate.completed && (
        <InterviewHeader
          questionNumber={candidate.questions.length}
          difficulty={currentQuestion?.difficulty}
          timeLeftSeconds={candidate.timeLeftSeconds}
        />
      )}

      <ChatMessages
        messages={messages}
        isLoadingQuestion={isLoadingQuestion}
        messagesEndRef={messagesEndRef}
      />

      {status === "in-progress" && !candidate.completed && (
        <ChatInput
          inputValue={inputValue}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          isSubmittingAnswer={isSubmittingAnswer}
          isLoadingQuestion={isLoadingQuestion}
          hasCurrentQuestion={!!currentQuestion}
        />
      )}
    </div>
  );
}