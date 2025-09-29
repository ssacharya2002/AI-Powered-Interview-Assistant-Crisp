import { useEffect, useRef } from "react";
import { setTimeLeft } from "@/store/features/interviewSlice";
import type { AppDispatch } from "@/store/store";

type UseInterviewTimerProps = {
  candidate: any;
  status: string | undefined;
  showResumeModal: boolean;
  dispatch: AppDispatch;
  onTimeUp: () => void;
};

export function useInterviewTimer({
  candidate,
  status,
  showResumeModal,
  dispatch,
  onTimeUp,
}: UseInterviewTimerProps) {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
   // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

   // Don't start timer if resume modal is shown
    if (showResumeModal) {
      return;
    }

    if (
      status === "in-progress" &&
      candidate.timeLeftSeconds !== null &&
      candidate.timeLeftSeconds! > 0
    ) {
      timerRef.current = window.setInterval(() => {
        const newTime = (candidate.timeLeftSeconds ?? 0) - 1;
        dispatch(setTimeLeft({ id: candidate.id, timeLeftSeconds: newTime }));

        if (newTime <= 0) {
          onTimeUp();
        }
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      };
    }
  }, [
    status,
    candidate.timeLeftSeconds,
    candidate.id,
    dispatch,
    showResumeModal,
    onTimeUp,
  ]);
}