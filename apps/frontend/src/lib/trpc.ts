import { createTRPCContext } from '@trpc/tanstack-react-query';
import type {
  AppRouter,
  RouterInputs,
  RouterOutputs,
} from '@repo/backend/trpc/exports';

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

export type { AppRouter, RouterInputs, RouterOutputs };
