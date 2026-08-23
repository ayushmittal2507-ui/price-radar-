import { Routes, Route } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import AppLayout     from './layouts/AppLayout';
import Home          from './pages/Home';
import Login         from './pages/Login';
import Signup        from './pages/Signup';
import Dashboard     from './pages/Dashboard';
import AddTracker    from './pages/AddTracker';
import TrackDetail   from './pages/TrackDetail';

export default function App() {
  return (
    <Routes>
      {/* ── Public routes (Navbar + Footer) ── */}
      <Route element={<DefaultLayout />}>
        <Route path="/"       element={<Home />} />
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* ── Protected routes (Navbar only, auth guard) ── */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/add"        element={<AddTracker />} />
        <Route path="/track/:id"  element={<TrackDetail />} />
      </Route>
    </Routes>
  );
}
