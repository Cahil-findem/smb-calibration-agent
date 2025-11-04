import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import DemoSetup from './pages/DemoSetup'
import Onboarding from './pages/Onboarding'
import GoalSelection from './pages/GoalSelection'
import ScreeningQuestions from './pages/ScreeningQuestions'
import RecipeLoader from './pages/RecipeLoader'
import CandidateReview from './pages/CandidateReview'
import OutreachContract from './pages/OutreachContract'
import Success from './pages/Success'

function App() {
  const navigate = useNavigate()

  const handleRestart = () => {
    // Clear any stored data
    localStorage.clear()
    sessionStorage.clear()
    // Navigate to demo setup page
    navigate('/')
  }

  return (
    <div className="App">
      <Header onRestart={handleRestart} />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<DemoSetup />} />
          <Route path="/demo-setup" element={<Navigate to="/" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/goal-selection" element={<GoalSelection />} />
          <Route path="/screening-questions" element={<ScreeningQuestions />} />
          <Route path="/recipe-loader" element={<RecipeLoader />} />
          <Route path="/candidate-review" element={<CandidateReview />} />
          <Route path="/outreach-contract" element={<OutreachContract />} />
          <Route path="/success" element={<Success />} />
          {/* Other routes will be added here */}
        </Routes>
      </div>
    </div>
  )
}

export default App
