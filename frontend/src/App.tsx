import { Route, Routes } from 'react-router';
import ErrorBoundary from './components/ErrorBoundary';
import RequireLogin from './components/RequireLogin';
import BusinessPage from './pages/BusinessPage';
import CounterPage from './pages/CounterPage';
import DisplayPage from './pages/DisplayPage';
import JoinPage from './pages/JoinPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import PosterPage from './pages/PosterPage';
import QueueSettingsPage from './pages/QueueSettingsPage';
import QueuesPage from './pages/QueuesPage';
import SignupPage from './pages/SignupPage';
import StaffPage from './pages/StaffPage';
import TokenPage from './pages/TokenPage';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/q/:queueId" element={<JoinPage />} />
        <Route path="/t/:tokenId" element={<TokenPage />} />
        <Route path="/display/:queueId" element={<DisplayPage />} />
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
          path="/queues/:queueId"
          element={
            <RequireLogin ownerOnly>
              <QueueSettingsPage />
            </RequireLogin>
          }
        />
        <Route
          path="/queues/:queueId/poster"
          element={
            <RequireLogin ownerOnly>
              <PosterPage />
            </RequireLogin>
          }
        />
        <Route
          path="/staff"
          element={
            <RequireLogin ownerOnly>
              <StaffPage />
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
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
