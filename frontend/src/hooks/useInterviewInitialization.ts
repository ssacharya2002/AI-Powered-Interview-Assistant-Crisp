import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Message} from "../lib/types";

type UseInterviewInitializationProps = {
  candidate: any;
  status: string | undefined;
  hasInitialized: boolean;
  setHasInitialized: (value: boolean) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setShowResumeModal: (value: boolean) => void;
  loadNextQuestion: () => void;
};

export function useInterviewInitialization({
  candidate,
  status,
  hasInitialized,
  setHasInitialized,
  setMessages,
  setShowResumeModal,
  loadNextQuestion,
}: UseInterviewInitializationProps) {
  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized) return;

    // completed interview refresh
    if (status === "completed") {
      setHasInitialized(true);
      return;
    }

    if (status === "in-progress") {
      // Checking if this is a refresh scenario
      const isRefresh =
        candidate.questions.length > 0 || candidate.answers.length > 0;

      if (isRefresh) {
        // Show resume modal
        setShowResumeModal(true);
        setHasInitialized(true);
        return;
      } else {
        // Fresh start
        setMessages([
          {
            id: uuidv4(),
            role: "system",
            content: `Welcome ${candidate.name}! Your interview for Full Stack Developer (React/Node) position is starting now. You will be asked 6 questions: 2 Easy, 2 Medium, and 2 Hard. Good luck!`,
            timestamp: new Date().toISOString(),
          },
        ]);

        // Load first question
        loadNextQuestion();
        setHasInitialized(true);
      }
    }
  }, [
    status,
    candidate.questions.length,
    candidate.answers.length,
    candidate.name,
    hasInitialized,
    setHasInitialized,
    setMessages,
    setShowResumeModal,
    loadNextQuestion,
  ]);
}