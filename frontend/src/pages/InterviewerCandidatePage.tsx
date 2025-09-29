import {
  removeCandidate,
} from "@/store/features/interviewSlice";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type RootState } from "@/store/store";
import { useAppDispatch } from "@/store/hooks";
import { selectCandidateById } from "@/store/features/selectors";

function InterviewerCandidatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const candidate = useSelector((state: RootState) =>
    selectCandidateById(id ?? "")(state)
  );

  useEffect(() => {
    if (!candidate) {
      navigate("/Interviewer");
    }
  }, [candidate, navigate]);

  const chatItems = useMemo(() => {
    if (!candidate)
      return [] as {
        qNum: number;
        question?: string | null;
        difficulty?: string | null;
        timeLimitSeconds?: number | null;
        answer?: string | null;
        aiScore?: number | null;
        aiFeedback?: string | null;
      }[];
    const items: {
      qNum: number;
      question?: string | null;
      difficulty?: string | null;
      timeLimitSeconds?: number | null;
      answer?: string | null;
      aiScore?: number | null;
      aiFeedback?: string | null;
    }[] = [];
    for (let i = 0; i < candidate.questions.length; i++) {
      const q = candidate.questions[i];
      const a = candidate.answers.find((x) => x.questionId === q.id);
      items.push({
        qNum: i + 1,
        question: q.question ?? "",
        difficulty: q.difficulty ?? null,
        timeLimitSeconds: q.timeLimitSeconds ?? null,
        answer: a?.answer ?? null,
        aiScore: a?.aiScore ?? null,
        aiFeedback: a?.aiFeedback ?? null,
      });
    }
    return items;
  }, [candidate]);

  if (!candidate) return null;

  const handleDelete = () => {
    const ok = window.confirm(
      "Delete this candidate? This action cannot be undone."
    );
    if (!ok) return;
    dispatch(removeCandidate({ id: candidate.id }));
    navigate("/Interviewer");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {candidate.name || "Unnamed Candidate"}
          </h1>
          <p className="text-sm text-gray-600">
            Status: {candidate.status || "pending"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            Delete Candidate
          </Button>
        </div>
      </div>

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="font-medium">{candidate.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="font-medium">{candidate.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Final Score</p>
            <p className="font-medium">
              {candidate.finalScore !== null &&
              candidate.finalScore !== undefined
                ? `${candidate.finalScore}/60`
                : "—"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 mb-6">
        <CardHeader>
          <CardTitle>AI Summary</CardTitle>
        </CardHeader>

        <CardContent>
          {candidate.summary ? (
            <div className="prose max-w-none whitespace-pre-wrap">
              {candidate.summary}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No AI summary available yet.
            </p>
          )}
        </CardContent>

        <CardFooter>
          <div className="text-sm text-gray-700">
            Recommendation:{" "}
            <span className="font-bold text-black">
              {" "}
              {candidate.recommendation
                ? candidate.recommendation.replace("-", " ")
                : "—"}
            </span>
          </div>
        </CardFooter>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="chat">Chat History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-1">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(candidate.skills ?? []).length > 0 ? (
                    (candidate.skills ?? []).map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">—</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Resume Text</p>
                <div className="rounded border p-3 bg-gray-50 text-sm whitespace-pre-wrap">
                  {candidate.resumeText || "No resume text available."}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card className="p-4">
            <div className="space-y-6">
              {chatItems.length === 0 && (
                <p className="text-sm text-gray-500">No questions asked yet.</p>
              )}
              {chatItems.map((item) => (
                <div key={item.qNum} className="space-y-2">
                  <div className="font-semibold">
                    Question {item.qNum}
                    {item.difficulty
                      ? ` (${String(item.difficulty).toUpperCase()})`
                      : ""}
                  </div>
                  <div className="rounded border p-3 bg-white">
                    {item.question || "—"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Time limit: {item.timeLimitSeconds ?? "—"}s
                  </div>
                  <div className="font-semibold">Answer</div>
                  <div className="rounded border p-3 bg-gray-50 whitespace-pre-wrap">
                    {item.answer || "—"}
                  </div>
                  <div className="text-sm text-gray-700">
                    AI Score: {item.aiScore ?? "—"}
                  </div>
                  {item.aiFeedback && (
                    <div className="text-sm text-gray-700">
                      AI Feedback: {item.aiFeedback}
                    </div>
                  )}
                  <hr className="my-4" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InterviewerCandidatePage;
