import * as http from 'http';
import * as express_serve_static_core from 'express-serve-static-core';

declare const app: express_serve_static_core.Express;
declare const server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

export { app as default, server };
