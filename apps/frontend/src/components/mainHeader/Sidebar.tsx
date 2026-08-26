'use client';
import { getFriendsOnlineSummary } from '@/utils';
import Link from 'next/link';
import LogOutButton from '../logOutButton';
import { useOnlinePresence } from '@/hooks/onlinePresence';
import { useAuth } from '@/context/AuthContext';
import { FriendRequests } from '../FriendRequests';
import { useToast } from '@/context/Toast/ToastContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar(props: SidebarProps) {
  const { isOpen, onClose } = props;
  const { profile } = useAuth();

  const { numProfilesOnline, activeProfiles } = useOnlinePresence({
    friendsOnly: true,
  });

  const numRecentlyActive = activeProfiles.length - numProfilesOnline;

  const profileLink = `/profile?profile=${profile?.id}`;

  const { dotColor, message } = getFriendsOnlineSummary({
    numOnline: numProfilesOnline,
    numRecentlyActive,
  });
  const { addToast } = useToast();
  const handleTestToast = () => {
    addToast({ header: 'Toast Test!', body: 'Heres a test', delay: 300000 });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-[92vw] max-w-sm transform border-l border-slate-200 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <button
              type="button"
              onClick={handleTestToast}
              className="text-left"
            >
              <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
              <p className="text-xs text-slate-500">Quick access and status</p>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Close menu"
            >
              <i className="bi bi-x-lg text-xl" />
            </button>
          </div>

          {/* Menu items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 sm:px-4">
            <ul className="space-y-2">
              {/* Friend Requests Accordion */}
              <li>
                <FriendRequests />
              </li>

              <li>
                <Link
                  href="/contacts"
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-slate-700 no-underline transition hover:bg-brand-neutral hover:text-slate-900"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                    <i className="bi bi-people-fill text-lg text-brand" />
                    <i
                      className={`bi bi-circle-fill absolute -top-0.5 -right-0.5 text-[10px] ${dotColor}`}
                    />
                  </div>
                  <span className="font-medium">{message}</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/find-friends"
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-slate-700 no-underline transition hover:bg-brand-neutral hover:text-slate-900"
                >
                  <i className="bi bi-person-plus-fill text-lg text-brand" />
                  <span className="font-medium">Find Friends</span>
                </Link>
              </li>

              <li>
                <Link
                  href={profileLink}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-slate-700 no-underline transition hover:bg-brand-neutral hover:text-slate-900"
                >
                  <i className="bi bi-person-circle text-lg text-brand" />
                  <span className="font-medium">Profile</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4">
            <LogOutButton />
          </div>
        </div>
      </div>
    </>
  );
}
