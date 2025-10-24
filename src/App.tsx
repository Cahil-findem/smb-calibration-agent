import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import DemoSetup from './pages/DemoSetup'
import Onboarding from './pages/Onboarding'
import Recipe1 from './pages/Recipe1'

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
          <Route path="/recipe1" element={<Recipe1 />} />
          {/* Other routes will be added here */}
          {/* <Route path="/recipe-loader" element={<RecipeLoader />} /> */}
          {/* <Route path="/recipe2" element={<Recipe2 />} /> */}
        </Routes>
      </div>
    </div>
  )
}

export default App
