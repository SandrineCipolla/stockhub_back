import {CorsOptions} from 'cors';

export const corsConfig: CorsOptions = {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204,
};

export const corsV2Config: CorsOptions = {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 200,
};
