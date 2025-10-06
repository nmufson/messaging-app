import * as _trpc_server from '@trpc/server';
import { Context } from '../trpc/context.js';
import 'express';
import '@db';
import '@trpc/server/adapters/express';
import 'http';
import '@trpc/server/adapters/ws';

declare const imageRouter: _trpc_server.TRPCBuiltRouter<{
    ctx: Context;
    meta: object;
    errorShape: _trpc_server.TRPCDefaultErrorShape;
    transformer: true;
}, _trpc_server.TRPCDecorateCreateRouterOptions<{
    getImageUploadSignature: _trpc_server.TRPCMutationProcedure<{
        input: void;
        output: {
            timestamp: number;
            signature: string;
            cloudName: string | undefined;
            apiKey: string | undefined;
        };
        meta: object;
    }>;
}>>;

export { imageRouter };
