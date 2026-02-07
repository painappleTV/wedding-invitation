import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatedBackground } from './components/AnimatedBackground';
import { TopPage } from './pages/TopPage';
import { InvitePage } from './pages/InvitePage';

function App() {
  return (
    <BrowserRouter>
      <AnimatedBackground />
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/invite/:code" element={<InvitePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
