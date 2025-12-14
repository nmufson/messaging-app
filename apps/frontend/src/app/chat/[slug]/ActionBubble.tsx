import { assertNever, formatDisplayDate, getProfileDisplayName } from '@/utils';
import { ChatActionDTO, ChatActionWithActorDTO } from '@repo/common';

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

const getActionText = (actionWithActor: ChatActionWithActorDTO) => {
  const { actor, target, actionType, content } = actionWithActor;
  const actingProfileName = getProfileDisplayName(actor);
  const targetProfileName = target ? getProfileDisplayName(target) : null;

  switch (actionType) {
    case 'CHAT_CREATED': {
      return `${actingProfileName} created the chat.`;
    }
    case 'MEMBER_ADDED': {
      if (!targetProfileName) return `${actingProfileName} added a member.`;
      return `${actingProfileName} added ${targetProfileName} to the chat.`;
    }

    case 'MEMBER_REMOVED': {
      if (!targetProfileName) return `${actingProfileName} removed a member.`;
      return `${actingProfileName} removed ${targetProfileName} from the chat.`;
    }

    case 'MEMBER_LEFT': {
      return `${actingProfileName} left the chat.`;
    }

    case 'NAME_CHANGED': {
      const textEnding = content ? ` to ${content}` : '';
      return `${actingProfileName} changed the chat name${textEnding}.`;
    }

    case 'PICTURE_CHANGED': {
      return `${actingProfileName} changed the chat picture.`;
    }

    default: {
      // to ensure we're covering all cases
      return assertNever(actionType);
    }
  }
};
