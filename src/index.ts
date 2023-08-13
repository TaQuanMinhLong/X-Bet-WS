import { UpsertUserInput, createUser, deleteUser, updateUser } from "./db";
import { Elysia, ws, t } from "elysia";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .onRequest(({ request }) => {
    console.log(`${request.method} - ${request.url}`);
  })
  .model(
    "auth-event",
    t.Union([
      t.Object({
        object: t.Literal("event"),
        type: t.Union([
          t.Literal("user.created"),
          t.Literal("user.updated"),
          t.Literal("user.deleted"),
        ]),
        data: t.Union([
          t.Object({
            id: t.String(),
            username: t.String(),
          }),
          t.Object({
            id: t.String(),
            deleted: t.Boolean(),
          }),
        ]),
      }),
    ])
  )
  .use(cors({ origin: process.env.CLIENT_ORIGIN }))
  .use(ws())
  .ws("/connect", {
    message(ws, message) {
      console.log({ message });
      ws.send(`The message you sent: ${message}`);
    },
    open(ws) {
      console.log({ ws_data: ws.data });
    },
    query: t.Object({}),
  })
  .post(
    "/auth",
    async ({ body: { data, type }, set }) => {
      switch (type) {
        case "user.created": {
          const { id, username } = data as UpsertUserInput;
          console.log(`Create user with username: ${username} and id: ${id}`);
          const create_result = createUser({ id, username });
          console.log({ create_result });
          return { success: true };
        }
        case "user.updated": {
          const { id, username } = data as UpsertUserInput;
          console.log(`Update user with username: ${username} and id: ${id}`);
          const update_result = updateUser({ id, username });
          console.log({ update_result });
          return { success: true };
        }
        case "user.deleted": {
          const { deleted, id } = data as { deleted: boolean; id: string };
          console.log(deleted, typeof deleted);
          if (deleted) {
            console.log("Delete user with id " + id);
            const delete_result = deleteUser(id);
            console.log({ delete_result });
            return { success: true };
          } else {
            set.status = 400;
            return { error: "Invalid Request" };
          }
        }
        default: {
          set.status = 400;
          return { error: "Invalid Request" };
        }
      }
    },
    { body: "auth-event" }
  )
  .get("*", () => "X-Bet API")
  .listen(8000);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
