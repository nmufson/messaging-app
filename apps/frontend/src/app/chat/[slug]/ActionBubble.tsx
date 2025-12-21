import { formatDisplayDate } from '@/utils';
import { getActionText } from '@/utils/general';
import { ChatActionWithActorDTO } from '@repo/common';

export function ActionBubble({ action }: { action: ChatActionWithActorDTO }) {
  const { createdAt } = action;

  const displayTime = formatDisplayDate(createdAt, { includeTime: true });
  const displayText = getActionText(action);

  return (
    <div className="flex justify-center mt-3 mb-3">
      <div className="flex flex-col items-center max-w-[80%]">
        <div
          className="inline-block break-words rounded-xl px-4 py-2 bg-gray-300 text-gray-700 text-center shadow-sm"
          style={{ overflowWrap: 'anywhere' }}
        >
          <p className="mb-1">{displayText}</p>
          <small className="block text-gray-600 leading-none">
            {displayTime}
          </small>
        </div>
      </div>
    </div>
  );
}
