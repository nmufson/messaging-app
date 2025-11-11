import { ProfileAvatar } from '@/components/ProfileAvatar';
import { useAuth } from '@/context/AuthContext';
import { formatDisplayDate, getProfileDisplayName } from '@/utils';
import { MessageWithSenderDTO } from '@repo/common';

interface MessageBubbleProps {
  message: MessageWithSenderDTO;
  showName?: boolean;
  showAvatar?: boolean;
}

export function MessageBubble(props: MessageBubbleProps) {
  const { profile } = useAuth();
  const { message, showName = true, showAvatar = true } = props;
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
      <div className="flex items-end gap-2 max-w-85/100">
        {shouldShowAvatar && <ProfileAvatar {...sender} size={35} />}
        <div className="flex flex-col">
          {shouldShowName && <small>{displayName}</small>}
          <div
            className={`rounded-xl px-4 py-2 shadow-md break-words '
            ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}
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
            <div>
              <small>{displayTime}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
