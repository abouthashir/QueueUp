import { Route, Routes } from 'react-router';
import CounterPage from './pages/CounterPage';
import JoinPage from './pages/JoinPage';
import TokenPage from './pages/TokenPage';

export default function App() {
  return (
    <Routes>
      <Route path="/q/:queueId" element={<JoinPage />} />
      <Route path="/t/:tokenId" element={<TokenPage />} />
      <Route path="/counter/:queueId" element={<CounterPage />} />
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
