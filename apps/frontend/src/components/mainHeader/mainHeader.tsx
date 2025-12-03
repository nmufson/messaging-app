import { useState } from 'react';
import { Sidebar } from './Sidebar';

export default function MainHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">Synk</h1>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <i className="bi bi-list text-2xl" />
        </button>
      </div>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
