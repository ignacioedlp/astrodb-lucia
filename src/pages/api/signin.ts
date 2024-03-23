import { lucia } from "@/auth";
import type { APIContext } from "astro";
import { User, db, eq } from "astro:db";
import { Argon2id } from "oslo/password";

export async function POST(context: APIContext): Promise<Response> {
  const formData = await context.request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  //validate username and password

  if (!username || !password) {
    return new Response("Invalid username or password are required", {
      status: 400,
    });
  }

  if (typeof username !== "string" || username.length < 4) {
    return new Response("Invalid username", { status: 400 });
  }

  if (typeof password !== "string" || password.length < 8) {
    return new Response("Invalid password", { status: 400 });
  }

  const user = (
    await db.select().from(User).where(eq(User.username, username))
  ).at(0);

  if (!user) {
    return new Response("Invalid username or password", { status: 400 });
  }

  if (!user.password) {
    return new Response("Invalid password", { status: 400 });
  }

  const validPassword = await new Argon2id().verify(user.password, password);

  if (!validPassword) {
    return new Response("Invalid username or password", { status: 400 });
  }

  //create session
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  context.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return context.redirect("/");
}
