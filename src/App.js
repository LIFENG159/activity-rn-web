import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ActivityPage from './pages/ActivityPage';
import AiAssistantPage from './pages/AiAssistantPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ActivityPage />} />
        <Route path="/ai" element={<AiAssistantPage />} />
      </Routes>
    </BrowserRouter>
  );
}
