import { useTRPC } from '@/lib/trpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function LogOutButton() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: logoutUser } = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        // immediately clear auth data
        console.log('Setting auth data to null on log out.');
        queryClient.setQueryData(trpc.auth.me.queryKey(), null);
        // Clear all queries to reset app state
        queryClient.clear();
        // Force page reload to close WebSocket and reset connection
        window.location.href = '/';
      },
    })
  );

  return <button onClick={() => logoutUser()}>Log Out</button>;
}
