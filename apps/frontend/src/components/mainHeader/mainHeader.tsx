import { Sidebar } from './Sidebar';
import { useToggle } from '@/hooks/general';

export default function MainHeader() {
  const { status: sidebarOpen, toggleStatus: toggleSidebarOpen } = useToggle();

  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-sm sm:px-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-[-0.04em] text-blue-600">
            Synk
          </h1>
        </div>
        <button
          onClick={toggleSidebarOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          aria-label="Open menu"
        >
          <i className="bi bi-list text-2xl" />
        </button>
      </div>
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebarOpen} />
    </>
  );
}
