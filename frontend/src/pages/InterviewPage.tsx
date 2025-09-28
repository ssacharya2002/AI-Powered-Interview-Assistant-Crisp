import { useParams } from "react-router-dom";

function InterviewPage() {
  const {id} = useParams();
  return (
    <div>
      InterviewPage - {id}
    </div>
  )
}

export default InterviewPage
