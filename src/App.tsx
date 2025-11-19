import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/homepage';                 
import DocsPage from './pages/documentation';
import AdminPanel  from './admin/AdminPanel';





export default function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />         {/* Root route */}
        <Route path="/docs" element={<DocsPage />} />    
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}
