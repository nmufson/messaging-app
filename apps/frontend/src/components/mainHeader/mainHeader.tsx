import Link from 'next/link';
import LogOutButton from '../logOutButton';

interface MainHeaderProps {
  numFriendsOnline: number;
}
export default function MainHeader(props: MainHeaderProps) {
  const { numFriendsOnline } = props;

  return (
    <div className="flex items-center justify-between p-4">
      <h1 className="text-2xl font-bold">Synk</h1>
      <div className="flex items-center gap-4">
        <LogOutButton />
        <Link
          href="/contacts"
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors no-underline text-inherit"
        >
          <i className="bi bi-person-fill text-lg"></i>
          <span className="text-sm font-medium">{numFriendsOnline} online</span>
        </Link>
        <Link
          href="/find-friends"
          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors no-underline text-inherit"
        >
          <i className="bi bi-people text-lg"></i>
          <span className="text-sm font-medium">Find Friends</span>
        </Link>
      </div>
    </div>
  );
}
