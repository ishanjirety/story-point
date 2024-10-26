import app from "./helpers/server";
import { env } from "./config/env";

app.listen({
  port: env.PORT,
  host: env.HOST,
});
