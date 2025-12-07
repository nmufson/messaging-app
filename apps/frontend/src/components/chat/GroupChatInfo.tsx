import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/Toast/ToastContext';
import { useToggle } from '@/hooks/general';
import { useTRPC } from '@/lib/trpc';
import { getChatDisplayName } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChatDTO, UpdateChatInput } from '@repo/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MouseEvent, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as R from 'remeda';
import { TextFieldGroup } from '../FieldGroup';
import { GroupPhoto } from '../GroupPhoto';
import { ProfilePreview } from '../profile/ProfilePreview';
import { ImageUpload } from '../ImageUpload';
import { Button } from '../button/button';

interface GroupChatInfoProps {
  chat: ChatDTO;
}

export function GroupChatInfo(props: GroupChatInfoProps) {
  const { status: editMode, toggleStatus: toggleEditMode } = useToggle();
  const trpc = useTRPC();

  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { chat } = props;
  const { profile } = useAuth();
  const {
    id: chatId,

    name,

    participants,

    groupPictureUrl,
  } = chat;

  const displayName = getChatDisplayName({
    name,
    participants,
    profileId: profile?.id,
  });

  const defaultValues = useMemo(
    () => UpdateChatInput.omit({ id: true }).parse(chat),
    [chat]
  );

  const {
    control,
    handleSubmit,
    formState: { dirtyFields, isDirty },
  } = useForm({
    resolver: zodResolver(UpdateChatInput.omit({ id: true })),
    defaultValues,
    mode: 'onBlur',
  });

  const { mutateAsync: updateChat, isPending } = useMutation(
    trpc.chat.update.mutationOptions({
      onSuccess: (updatedChat) => {
        const chatQueryKey = trpc.chat.findChat.queryKey({
          chatId,
        });
        const oldData = queryClient.getQueryData(chatQueryKey);

        if (oldData) {
          console.log({ oldData, updateChat }, 'setting query data');
          queryClient.setQueryData(chatQueryKey, {
            ...oldData,
            ...updatedChat,
          });
        }

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
    try {
      const dirtyFieldKeys = R.keys(dirtyFields);
      const updatedFields = R.pick(data, dirtyFieldKeys);
      await updateChat({ id: chat.id, ...updatedFields });
      toggleEditMode();
    } catch (error) {
      console.error(error, 'Failed to update chat.');
    }
  };

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
