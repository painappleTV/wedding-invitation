import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TopPage } from './pages/TopPage';
import { InvitePage } from './pages/InvitePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/invite/:code" element={<InvitePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
