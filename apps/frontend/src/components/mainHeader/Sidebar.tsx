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

  const { numProfilesOnline, activeProfiles } = useOnlinePresence();

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
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold" onClick={handleTestToast}>
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Close menu"
            >
              <i className="bi bi-x-lg text-xl" />
            </button>
          </div>

          {/* Menu items */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {/* Friend Requests Accordion */}
              <li>
                <FriendRequests />
              </li>

              <li>
                <Link
                  href="/contacts"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 no-underline text-inherit"
                >
                  <div className="relative">
                    <i className="bi bi-people-fill text-xl" />
                    <i
                      className={`bi bi-circle-fill text-xs absolute -top-1 -right-1 ${dotColor}`}
                    />
                  </div>
                  <span>{message}</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/find-friends"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 no-underline text-inherit"
                >
                  <i className="bi bi-person-plus-fill text-xl" />
                  <span>Find Friends</span>
                </Link>
              </li>

              <li>
                <Link
                  href={profileLink}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 no-underline text-inherit"
                >
                  <i className="bi bi-person-circle text-xl" />
                  <span>Profile</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <LogOutButton />
          </div>
        </div>
      </div>
    </>
  );
}
