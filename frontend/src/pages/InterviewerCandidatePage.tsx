
import { useParams } from 'react-router-dom'

function InterviewerCandidatePage() {
  const {id} = useParams();
  return (
    <div>
      {id}
    </div>
  )
}

export default InterviewerCandidatePage
