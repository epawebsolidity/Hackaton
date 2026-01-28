import cors from "cors";
import express, { Application } from "express";
import session from "express-session";

import path from "path";
import addresRouter from "./router/addres.route";
import chatPersonalRoute from "./router/chat.route";
import groupChatRoute from "./router/grouchat.route";
import messageChatRoute from "./router/message.route";
import messageGroupChat from "./router/messagegroup.route";
import rolesRoute from "./router/roles.route";
import signinRoute from "./router/signin.route";
import subscribeRouter from "./router/subscribe.route";
import usersRoute from "./router/users.route";
const app: Application = express();


app.use(
  cors({
    origin: (origin, callback) => callback(null, true), 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
  }),
);

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


app.use("/images", express.static(path.join(__dirname, "/images")));
app.use("/imagesGroup", express.static(path.join(__dirname, "/imagesGroup")));

app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use("/api/users", usersRoute);
app.use("/api/address", addresRouter);
app.use("/api/roles", rolesRoute);
app.use("/api/signin", signinRoute);
app.use("/api/subscribe", subscribeRouter);
app.use("/api/chatpersonal", chatPersonalRoute);
app.use("/api/message", messageChatRoute);
app.use("/api/group", groupChatRoute);
app.use("/api/messageGroup", messageGroupChat);

export default app;
