import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import type { Answer } from "@/lib/schemas";
import { useAppDispatch } from "@/store/hooks";
import {
  updateCandidateFields,
  requestNextQuestion,
  submitAnswerLocal,
  submitAnswer,
  finalizeInterview,
  updateAnswer,
} from "@/store/features/interviewSlice";
import { useInterviewTimer } from "@/hooks/useInterviewTimer";
import { useInterviewInitialization } from "@/hooks/useInterviewInitialization";
import { MissingFieldsForm } from "@/components/MissingFieldsForm";
import { StartInterviewScreen } from "@/components/StartInterviewScreen";
import { ResumeInterviewModal } from "@/components/ResumeInterviewModal";
import { InterviewChatInterface } from "@/components/InterviewChatInterface";
import { InterviewCompletedScreen } from "@/components/InterviewCompletedScreen";
import type { Message } from "@/lib/types";
import { selectCandidateById, selectCurrentQuestion } from "@/store/features/selectors";

function InterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const candidate = useSelector(selectCandidateById(id ?? ""));
  const currentQuestion = useSelector(selectCurrentQuestion(id ?? ""));
  const status = candidate?.status;

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // candidate not found
  useEffect(() => {
    if (!candidate) {
      navigate("/");
    }
  }, [candidate, navigate]);

  // if candidate doesn't exist
  if (!candidate) {
    return null;
  }

  // Build missing fields list
  const missingFields: (keyof typeof candidate)[] = [];
  if (!candidate.name) missingFields.push("name");
  if (!candidate.email) missingFields.push("email");
  if (!candidate.phone) missingFields.push("phone");
  const currentField = missingFields[0];

  // Custom hooks
  useInterviewTimer({
    candidate,
    status,
    showResumeModal,
    dispatch,
    onTimeUp: handleAutoSubmit,
  });

  useInterviewInitialization({
    candidate,
    status,
    hasInitialized,
    setHasInitialized,
    setMessages,
    setShowResumeModal,
    loadNextQuestion,
  });

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handler functions
  const handleFieldSubmit = () => {
    if (!currentField || !inputValue.trim()) return;

    dispatch(
      updateCandidateFields({
        id: candidate.id,
        patch: {
          [currentField]: inputValue.trim(),
        },
      })
    );

    setInputValue("");
  };

  const handleStartInterview = () => {
    dispatch(
      updateCandidateFields({
        id: candidate.id,
        patch: {
          status: "in-progress",
          completed: false,
        },
      })
    );
  };

  const handleResumeInterview = () => {
    setShowResumeModal(false);

    setMessages([
      {
        id: uuidv4(),
        role: "system",
        content: `Welcome back ${candidate.name}! Resuming your interview...`,
        timestamp: new Date().toISOString(),
      },
    ]);

    // Show previously answered Q&A
    const answeredCount = candidate.answers.length;
    for (let i = 0; i < Math.min(answeredCount, candidate.questions.length); i++) {
      const question = candidate.questions[i];
      const answer = candidate.answers.find((a) => a.questionId === question.id);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuidv4(),
          role: "assistant",
          content: `Question ${i + 1}/6 (${question.difficulty?.toUpperCase()})\n\n${
            question.question
          }\n\n⏱️ Time limit: ${question.timeLimitSeconds}s`,
          timestamp: question.createdAt ?? new Date().toISOString(),
        },
      ]);

      if (answer) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: uuidv4(),
            role: "user",
            content: answer.answer ?? "",
            timestamp: answer.submittedAt ?? new Date().toISOString(),
          },
        ]);
      }
    }

    // Show current unanswered question
    if (candidate.questions.length > candidate.answers.length && currentQuestion) {
      const questionNumber = candidate.answers.length + 1;
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuidv4(),
          role: "assistant",
          content: `Question ${questionNumber}/6 (${currentQuestion.difficulty?.toUpperCase()})\n\n${
            currentQuestion.question
          }\n\n⏱️ Time limit: ${currentQuestion.timeLimitSeconds}s`,
          timestamp: currentQuestion.createdAt ?? new Date().toISOString(),
        },
      ]);
    }
  };

  const handleStartFresh = () => {
    setShowResumeModal(false);
    setHasInitialized(false);
    dispatch(
      updateCandidateFields({
        id: candidate.id,
        patch: {
          questions: [],
          answers: [],
          currentQuestionIndex: 0,
          timeLeftSeconds: null,
          status: "in-progress",
          completed: false,
        },
      })
    );
  };

  

  async function loadNextQuestion() {
    const c = candidate; 
    if (!c) return;
    if (c.questions.length >= 6) {
      await finalizeInterviewProcess();
      return;
    }

    setIsLoadingQuestion(true);
    try {
      const result = await dispatch(
        requestNextQuestion({ sessionId: c.id })
      ).unwrap();

      const questionNum = c.questions.length + 1;
      const question = result.question;

      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: `Question ${questionNum}/6 (${question.difficulty?.toUpperCase()})\n\n${
            question.question
          }\n\n⏱️ Time limit: ${question.timeLimitSeconds}s`,
          timestamp: question.createdAt ?? new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to load question:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "system",
          content: "⚠️ Failed to load next question. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoadingQuestion(false);
    }
  }

  const handleAnswerSubmit = async () => {
    if (!currentQuestion || !inputValue.trim() || isSubmittingAnswer) return;

    const answerText = inputValue.trim();
    const timeTaken =
      (currentQuestion.timeLimitSeconds ?? 0) - (candidate.timeLeftSeconds ?? 0);

    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        role: "user",
        content: answerText,
        timestamp: new Date().toISOString(),
      },
    ]);

    setInputValue("");
    setIsSubmittingAnswer(true);

    const answer: Answer = {
      questionId: currentQuestion.id,
      answer: answerText,
      timeTakenSeconds: timeTaken,
      submittedAt: new Date().toISOString(),
      autoSubmitted: false,
      aiScore: null,
      aiFeedback: null,
    };

    dispatch(submitAnswerLocal({ id: candidate.id, answer }));

    try {
      const result = await dispatch(
        submitAnswer({
          sessionId: candidate.id,
          questionId: currentQuestion.id,
          answerText,
          timeTakenSeconds: timeTaken,
          autoSubmitted: false,
        })
      ).unwrap();

      dispatch(
        updateAnswer({
          id: candidate.id,
          answer: {
            questionId: currentQuestion.id,
            aiScore: result.aiScore,
            aiFeedback: result.aiFeedback,
          },
        })
      );

      if (candidate.answers.length + 1 >= 6) {
        await finalizeInterviewProcess();
      } else {
        setTimeout(() => {
          loadNextQuestion();
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "system",
          content: "⚠️ Failed to score answer. Moving to next question...",
          timestamp: new Date().toISOString(),
        },
      ]);

      if (candidate.answers.length < 6) {
        setTimeout(() => {
          loadNextQuestion();
        }, 2000);
      }
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  async function handleAutoSubmit() {
    if (!currentQuestion || isSubmittingAnswer) return;
    const c = candidate!;

    const answerText = inputValue.trim() || "(No answer provided - Time expired)";
    const timeTaken = currentQuestion.timeLimitSeconds ?? 0;

    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        role: "system",
        content: "⏰ Time's up! Auto-submitting your answer...",
        timestamp: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        role: "user",
        content: answerText,
        timestamp: new Date().toISOString(),
      },
    ]);

    setInputValue("");
    setIsSubmittingAnswer(true);

    const answer: Answer = {
      questionId: currentQuestion.id,
      answer: answerText,
      timeTakenSeconds: timeTaken,
      submittedAt: new Date().toISOString(),
      autoSubmitted: true,
      aiScore: null,
      aiFeedback: null,
    };

    dispatch(submitAnswerLocal({ id: c.id, answer }));

    try {
      const result = await dispatch(
        submitAnswer({
          sessionId: c.id,
          questionId: currentQuestion.id,
          answerText,
          timeTakenSeconds: timeTaken,
          autoSubmitted: true,
        })
      ).unwrap();

      dispatch(
        updateAnswer({
          id: c.id,
          answer: {
            questionId: currentQuestion.id,
            aiScore: result.aiScore,
            aiFeedback: result.aiFeedback,
          },
        })
      );

      if (c.answers.length + 1 >= 6) {
        await finalizeInterviewProcess();
      } else {
        setTimeout(() => {
          loadNextQuestion();
        }, 2000);
      }
    } catch (error) {
      console.error("Auto-submit failed:", error);
      if (c.answers.length < 6) {
        setTimeout(() => {
          loadNextQuestion();
        }, 2000);
      }
    } finally {
      setIsSubmittingAnswer(false);
    }
  }

  const finalizeInterviewProcess = async () => {
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        role: "system",
        content: "🎉 Interview completed! Calculating your final score...",
        timestamp: new Date().toISOString(),
      },
    ]);

    try {
      const result = await dispatch(
        finalizeInterview({ sessionId: candidate.id })
      ).unwrap();

      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "system",
          content: "✅ Interview completed successfully! Thank you for your time.",
          timestamp: new Date().toISOString(),
        },
      ]);

      dispatch(
        updateCandidateFields({
          id: candidate.id,
          patch: {
            status: "completed",
            completed: true,
            recommendation: result.recommendation,
            finalScore: result.finalScore,
            summary: result.summary,
            updatedAt: new Date().toISOString(),
          },
        })
      );
    } catch (error) {
      console.error("Failed to finalize interview:", error);
      dispatch(
        updateCandidateFields({
          id: candidate.id,
          patch: {
            status: "completed",
            completed: true,
            updatedAt: new Date().toISOString(),
          },
        })
      );
    }
  };

  // Render different screens based on state
  if (currentField) {
    return (
      <MissingFieldsForm
        fieldName={currentField}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSubmit={handleFieldSubmit}
      />
    );
  }

  if (status !== "in-progress" && status !== "completed") {
    return <StartInterviewScreen onStart={handleStartInterview} />;
  }

  if (showResumeModal) {
    return (
      <ResumeInterviewModal
        onResume={handleResumeInterview}
        onStartFresh={handleStartFresh}
      />
    );
  }

  if (candidate.completed) {
    return (
      <InterviewCompletedScreen
        finalScore={candidate.finalScore ?? null}
        recommendation={candidate.recommendation ?? null}
      />
    );
  }

  return (
    <InterviewChatInterface
      candidate={candidate}
      currentQuestion={currentQuestion}
      messages={messages}
      inputValue={inputValue}
      isLoadingQuestion={isLoadingQuestion}
      isSubmittingAnswer={isSubmittingAnswer}
      messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
      onInputChange={setInputValue}
      onSubmit={handleAnswerSubmit}
    />
  );
}

export default InterviewPage;