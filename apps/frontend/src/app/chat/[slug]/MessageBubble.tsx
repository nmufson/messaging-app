import { ProfileAvatar } from '@/components/ProfileAvatar';
import { useAuth } from '@/context/AuthContext';
import { formatDisplayDate, getProfileDisplayName } from '@/utils';
import { MessageWithSenderDTO } from '@repo/common';

interface MessageBubbleProps {
  message: MessageWithSenderDTO;
  showName?: boolean;
  showAvatar?: boolean;
  showTime?: boolean;
}

export function MessageBubble(props: MessageBubbleProps) {
  const { profile } = useAuth();
  const {
    message,
    showName = true,
    showAvatar = true,
    showTime = true,
  } = props;
  const { sender, content, imageUrl, createdAt } = message;

  const displayTime = formatDisplayDate(createdAt);
  const displayName = getProfileDisplayName({ ...sender });
  const isCurrentUser = profile?.id === sender.id;

  const shouldShowName = !isCurrentUser && showName;
  const shouldShowAvatar = !isCurrentUser && showAvatar;

  return (
    <div
      className={`flex mt-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className="flex items-end gap-1 w-full">
        <div className="flex justify-center w-12/100">
          {shouldShowAvatar && <ProfileAvatar {...sender} size={35} />}
        </div>
        <div
          className={`flex flex-col flex-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}
        >
          {shouldShowName && <small className="ml-1.5">{displayName}</small>}
          <div
            className={`inline-block max-w-fit break-words rounded-xl px-3 py-2 whitespace-pre-line shadow-md'
            ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}
            style={{ overflowWrap: 'anywhere' }}
          >
            <div>
              {content ? (
                <p>{content}</p>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  className="max-w-[200px] max-h-[200px] rounded-lg"
                />
              ) : null}
            </div>
            {showTime && (
              <small className="block text-right leading-none mt-1">
                {displayTime}
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
