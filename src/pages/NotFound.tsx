import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-4 text-lg text-gray-600">Halaman tidak ditemukan</p>
      <Link
        to="/dashboard"
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
