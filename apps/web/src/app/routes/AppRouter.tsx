import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('@/pages/Home'));
const Drafts = lazy(() => import('@/pages/Drafts'));
const Settings = lazy(() => import('@/pages/Settings'));

export function AppRouter() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/drafts" element={<Drafts />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
