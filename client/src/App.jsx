import React, { useEffect, useState } from 'react';

import UserPage from './pages/UserPage';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const getPage = () => {
    const hash = window.location.hash.toLowerCase();

    if (hash === '#admin') {
      return 'admin';
    }

    return 'user';
  };

  const [page, setPage] = useState(getPage());

  useEffect(() => {
    const handleHashChange = () => {
      setPage(getPage());
    };

    window.addEventListener(
      'hashchange',
      handleHashChange
    );

    return () => {
      window.removeEventListener(
        'hashchange',
        handleHashChange
      );
    };
  }, []);

  return (
    <>
      {/* TOP SWITCH */}
      <div className="fixed right-4 top-4 z-50 flex rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-xl">

        <button
          onClick={() => {
            window.location.hash = '';
          }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            page === 'user'
              ? 'bg-sky-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          User
        </button>

        <button
          onClick={() => {
            window.location.hash = 'admin';
          }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            page === 'admin'
              ? 'bg-sky-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Admin
        </button>

      </div>

      {page === 'admin' ? (
        <AdminDashboard />
      ) : (
        <UserPage />
      )}
    </>
  );
}