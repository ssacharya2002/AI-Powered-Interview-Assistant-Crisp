import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { type RootState } from "@/store/store";
import { ChevronUp, ChevronDown } from "lucide-react";

type SortField = "name" | "status" | "finalScore" | "recommendation";
type SortOrder = "asc" | "desc";

interface SortEntry {
  field: SortField;
  order: SortOrder;
}

export function CandidatesDashboard() {
  const navigate = useNavigate();
  const candidates = useSelector((state: RootState) => state.interview.candidates);

  const [searchTerm, setSearchTerm] = useState("");
  const [sorts, setSorts] = useState<SortEntry[]>([
    { field: "finalScore", order: "desc" },
  ]);

  const toggleSort = (field: SortField) => {
    setSorts((prev) => {
      const existing = prev.find((s) => s.field === field);
      if (existing) {
        return prev.filter((s) => s.field !== field);
      }
      return [...prev, { field, order: "desc" }];
    });
  };

  const filteredCandidates = useMemo(() => {
    const filtered = candidates.filter((c) => 
      c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    filtered.sort((a, b) => {
      for (let sort of sorts) {
        let aVal: any, bVal: any;
        switch (sort.field) {
          case "name":
            aVal = a.name ?? "";
            bVal = b.name ?? "";
            break;
          case "status":
            aVal = a.status ?? "pending";
            bVal = b.status ?? "pending";
            break;
          case "finalScore":
            aVal = a.finalScore ?? 0;
            bVal = b.finalScore ?? 0;
            break;
          case "recommendation":
            aVal = a.recommendation ?? "not-sure";
            bVal = b.recommendation ?? "not-sure";
            break;
        }

        if (aVal < bVal) return sort.order === "asc" ? -1 : 1;
        if (aVal > bVal) return sort.order === "asc" ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [candidates, searchTerm, sorts]);

  const renderSortIcon = (field: SortField) => {
    const sort = sorts.find((s) => s.field === field);
    if (!sort) return null;
    return sort.order === "asc" ? (
      <ChevronUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="inline w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Interviewer Dashboard</h2>
        <p className="text-gray-600">Manage and review candidate interviews</p>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search by candidate name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center">
                  Name {renderSortIcon("name")}
                </div>
              </TableHead>

              <TableHead
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleSort("status")}
              >
                <div className="flex items-center">
                  Status {renderSortIcon("status")}
                </div>
              </TableHead>

              <TableHead className="text-center">Questions</TableHead>

              <TableHead
                className="cursor-pointer hover:bg-gray-100 transition-colors text-center"
                onClick={() => toggleSort("finalScore")}
              >
                <div className="flex items-center justify-center">
                  Final Score {renderSortIcon("finalScore")}
                </div>
              </TableHead>

              <TableHead
                className="cursor-pointer hover:bg-gray-100 transition-colors text-center"
                onClick={() => toggleSort("recommendation")}
              >
                <div className="flex items-center justify-center">
                  Recommendation {renderSortIcon("recommendation")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>

        <TableBody>
          {filteredCandidates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No candidates found. Upload a resume to get started.
              </TableCell>
            </TableRow>
          ) : (
            filteredCandidates.map((c) => (
              <TableRow key={c.id} className="hover:bg-gray-50">
                <TableCell
                  className="text-blue-600 cursor-pointer font-medium"
                  onClick={() => navigate(`candidate/${c.id}`)}
                >
                  {c.name || "Unnamed Candidate"}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    c.status === "completed" 
                      ? "bg-green-100 text-green-800" 
                      : c.status === "in-progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {c.status || "pending"}
                  </span>
                </TableCell>
                <TableCell className="text-center">{c.questions.length}</TableCell>
                <TableCell className="text-center font-medium">
                  {c.finalScore !== null && c.finalScore !== undefined ? `${c.finalScore}/60` : "—"}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    c.recommendation === "hire" 
                      ? "bg-green-100 text-green-800" 
                      : c.recommendation === "not-hire"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {c.recommendation === "hire" ? "Hire" : 
                     c.recommendation === "not-hire" ? "Not Hire" : 
                     c.recommendation === "not-sure" ? "Not Sure" : "—"}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        </Table>
      </div>
    </div>
  );
}
