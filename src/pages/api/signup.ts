import type { APIContext } from "astro";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { db, User } from "astro:db";
import { lucia } from "@/auth";

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

  //check if the user already exists
  const userId = generateId(15);
  const hashedPassword = await new Argon2id().hash(password);

  //create user
  await db.insert(User).values({
    id: userId,
    username,
    password: hashedPassword,
  });

  //create session
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  context.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return context.redirect("/");
}
