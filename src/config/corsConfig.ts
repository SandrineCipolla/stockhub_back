import cors from "cors";
import { rootSecurity } from "../Utils/logger";

const allowedOrigins = ["*"];

export const corsConfig = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
rootSecurity.info("CORS configuration allowed origins:");

allowedOrigins.forEach((current) => {
  rootSecurity.info(` - ${current}`);
});
