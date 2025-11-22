interface MainHeaderProps {
  numFriendsOnline: number;
}
export default function MainHeader(props: MainHeaderProps) {
  const { numFriendsOnline } = props;

  return (
    <div className="flex items-center justify-between p-4">
      <h1 className="text-2xl font-bold">Chats</h1>
      <div className="flex items-center gap-4">
        <button
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          onClick={() => {
            // TODO: Navigate to contacts page
            console.log('Navigate to contacts');
          }}
        >
          <i className="bi bi-person-fill text-lg"></i>
          <span className="text-sm font-medium">{numFriendsOnline} online</span>
        </button>
        <button
          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          onClick={() => {
            // TODO: Navigate to find friends page
            console.log('Navigate to find friends');
          }}
        >
          <i className="bi bi-people text-lg"></i>
          <span className="text-sm font-medium">Find Friends</span>
        </button>
      </div>
    </div>
  );
}
