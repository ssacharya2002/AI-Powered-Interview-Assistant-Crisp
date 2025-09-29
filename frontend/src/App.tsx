import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import Layout from "./components/Layout";
import UploadResume from "./pages/UploadResume";
import InterviewPage from "./pages/InterviewPage";
import InterviewerPage from "./pages/InterviewerPage";
import InterviewerCandidatePage from "./pages/InterviewerCandidatePage";

function App() {
  return (
    <div>
      <Navbar />

      <div className="pt-20 px-6">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<UploadResume />} />
            <Route path="interview/:id" element={<InterviewPage />} />
          </Route>

          <Route path="/Interviewer" element={<Layout />}>
            <Route index element={<InterviewerPage />} />
            <Route
              path="candidate/:id"
              element={<InterviewerCandidatePage />}
            />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
