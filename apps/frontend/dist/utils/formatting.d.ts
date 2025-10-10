import { ObjectId } from '@common/src/schemas/primitives';
import { ChatType } from '@db/dist';
import { DateTime } from 'luxon';
export declare function formatMessageTime(dt: DateTime): string;
export declare function slugify(str: string): string;
interface ChatParticipant {
    id: ObjectId;
    firstName: string;
    lastName: string;
    profilePictureUrl: string | null;
}
interface GetChatNameParams {
    type: ChatType;
    name: string | null;
    participants: ChatParticipant[];
    userId?: ObjectId;
}
export declare function getChatName(params: GetChatNameParams): string;
export {};
