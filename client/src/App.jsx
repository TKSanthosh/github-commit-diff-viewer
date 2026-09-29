import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CommitPage from './pages/CommitPage';
import './styles/global.css';
import './styles/commit.css';

const DEFAULT_COMMIT_URL =
  '/repositories/golemfactory/clay/commit/a1bf367b3af680b1182cc52bb77ba095764a11f9';

export default function App() {
  return (
    <Routes>
      {/* Required Fleet Studio Commit Route */}
      <Route
        path="/repositories/:owner/:repository/commit/:commitSHA"
        element={<CommitPage />}
      />

      {/* Fallback to default required example commit for convenience */}
      <Route path="/" element={<Navigate to={DEFAULT_COMMIT_URL} replace />} />
      <Route path="*" element={<Navigate to={DEFAULT_COMMIT_URL} replace />} />
    </Routes>
  );
}
