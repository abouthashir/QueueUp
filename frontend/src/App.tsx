import { Route, Routes } from 'react-router';
import JoinPage from './pages/JoinPage';

export default function App() {
  return (
    <Routes>
      <Route path="/q/:queueId" element={<JoinPage />} />
      <Route
        path="*"
        element={
          <main className="page">
            <h1>Page not found</h1>
          </main>
        }
      />
    </Routes>
  );
}
