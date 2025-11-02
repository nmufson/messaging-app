import { formatDisplayDate } from '@/utils';
import { MessageDTO } from '@repo/common';

interface MessageBubbleProps {
  message: MessageDTO;
  isCurrentUser: boolean;
}

export function MessageBubble(props: MessageBubbleProps) {
  const { message, isCurrentUser } = props;
  const { senderId, content, imageUrl, createdAt } = message;
  const displayTime = formatDisplayDate(createdAt);

  return (
    <div
      className={`flex w-full mt-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-75/100 rounded-xl px-4 py-2 shadow-md break-words '
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
  );
}
