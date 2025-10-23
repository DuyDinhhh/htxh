// src/echo.js
import Echo from "laravel-echo";

import Pusher from "pusher-js";
Pusher.logToConsole = true;

window.Pusher = Pusher;

const PUSHER_KEY = process.env.REACT_APP_PUSHER_APP_KEY;

const PUSHER_CLUSTER = process.env.REACT_APP_PUSHER_APP_CLUSTER || "ap1";

if (!PUSHER_KEY) {
  throw new Error(
    "Missing Pusher key. Set REACT_APP_PUSHER_APP_KEY in your .env file."
  );
}

export const echo = new Echo({
  broadcaster: "pusher",
  key: PUSHER_KEY,
  cluster: PUSHER_CLUSTER,
  forceTLS: true,
});
