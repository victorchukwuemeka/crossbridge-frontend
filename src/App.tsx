import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing';                 
import DocsPage from './pages/documentation';
import AdminPanel from './admin/AdminPanel';
import HomePage from './pages/homepage'; 

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />        
        <Route path="/bridge" element={<HomePage />} />     
        <Route path="/docs" element={<DocsPage />} />    
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}
