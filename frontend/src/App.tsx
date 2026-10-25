import { Route, Routes } from 'react-router';
import RequireLogin from './components/RequireLogin';
import CounterPage from './pages/CounterPage';
import JoinPage from './pages/JoinPage';
import LoginPage from './pages/LoginPage';
import QueuesPage from './pages/QueuesPage';
import SignupPage from './pages/SignupPage';
import TokenPage from './pages/TokenPage';
import BusinessPage from './pages/BusinessPage';

export default function App() {
  return (
    <Routes>
      <Route path="/q/:queueId" element={<JoinPage />} />
      <Route path="/t/:tokenId" element={<TokenPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireLogin>
            <QueuesPage />
          </RequireLogin>
        }
      />
      <Route
        path="/counter/:queueId"
        element={
          <RequireLogin>
            <CounterPage />
          </RequireLogin>
        }
      />
      <Route
        path="/business"
        element={
          <RequireLogin ownerOnly>
            <BusinessPage />
          </RequireLogin>
        }
      />
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
