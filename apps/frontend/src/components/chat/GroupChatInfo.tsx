import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/Toast/ToastContext';
import { useToggle } from '@/hooks/general';
import { useTRPC } from '@/lib/trpc';
import { getChatDisplayName } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChatDTO, ObjectId, UpdateChatInput } from '@repo/common';
import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { MouseEvent, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Spinner } from 'react-bootstrap';
import * as R from 'remeda';
import { TextFieldGroup } from '../FieldGroup';
import { GroupPhoto } from '../GroupPhoto';
import { ProfilePreview } from '../profile/ProfilePreview';
import { ImageUpload } from '../ImageUpload';
import { Button } from '../button/button';

export function GroupChatInfo({ chatId }: { chatId: ObjectId | null }) {
  const {
    status: editMode,
    toggleStatus: toggleEditMode,
    setStatus: setEditMode,
  } = useToggle();
  const trpc = useTRPC();
  const { profile } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: chat, isLoading } = useQuery(
    trpc.chat.byId.queryOptions(chatId ? { chatId } : skipToken)
  );

  const defaultValues = useMemo(() => {
    if (!chat) {
      return UpdateChatInput.omit({ id: true }).parse({
        name: '',
        groupPictureUrl: '',
      });
    }
    return UpdateChatInput.omit({ id: true }).parse(chat);
  }, [chat]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { dirtyFields, isDirty },
  } = useForm({
    resolver: zodResolver(UpdateChatInput.omit({ id: true })),
    defaultValues,
    mode: 'onBlur',
  });

  // reset when chat data loads or changes
  useEffect(() => {
    if (chat) {
      reset(UpdateChatInput.omit({ id: true }).parse(chat));
    }
  }, [chat, reset]);

  const { mutateAsync: updateChat, isPending } = useMutation(
    trpc.chat.updateInfo.mutationOptions({
      onSuccess: (updatedChat) => {
        const chatByIdQueryKey = trpc.chat.byId.queryKey({
          chatId: chatId ?? undefined,
        });
        const findChatQueryKey = trpc.chat.findChat.queryKey({
          chatId: chatId ?? undefined,
        });

        queryClient.setQueryData(chatByIdQueryKey, updatedChat);
        queryClient.setQueryData(findChatQueryKey, updatedChat);

        // Reset form with updated values
        reset(UpdateChatInput.omit({ id: true }).parse(updatedChat));

        addToast({
          header: 'Success',
          body: 'Chat updated successfully!',
          variant: 'success',
        });
      },
      onError: (error) => {
        addToast({
          header: 'Error',
          body:
            error.message || 'Failed to update chat, please try again later.',
          variant: 'danger',
        });
      },
    })
  );

  const onSubmit = async (data: Omit<UpdateChatInput, 'id'>) => {
    if (!chatId) return;
    try {
      const dirtyFieldKeys = R.keys(dirtyFields);
      const updatedFields = R.pick(data, dirtyFieldKeys);
      await updateChat({ id: chatId, ...updatedFields });
      setEditMode(false);
    } catch (error) {
      console.error(error, 'Failed to update chat.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }
  console.log(editMode, isDirty);
  if (!chat) return null;

  const { name, participants, groupPictureUrl } = chat;

  const displayName = getChatDisplayName({
    name,
    participants,
    profileId: profile?.id,
  });
  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-center py-5"
      >
        <ImageUpload
          name="groupPictureUrl"
          control={control}
          imageClassName="rounded-full object-cover"
          imageSize={100}
          fallback={
            <GroupPhoto
              groupPictureUrl={groupPictureUrl}
              participants={participants}
              size={100}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          }
        />

        <div className="flex justify-between items-center gap-2 px-4">
          <div></div>
          {editMode || isDirty ? (
            <>
              <TextFieldGroup type="text" name="name" control={control} />
              <Button type="submit" disabled={isPending}>
                <i className="bi bi-floppy" />
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-2xl">{displayName}</h1>
              <Button
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  toggleEditMode();
                }}
              >
                <i className="bi bi-pencil text-xl" />
              </Button>
            </>
          )}
        </div>
      </form>

      <div>
        <h3>Members</h3>
        <div>
          {participants.map((p) => (
            <ProfilePreview key={p.id} profile={p} showPresence={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
