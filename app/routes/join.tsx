import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { error } from "node:console";
import { useEffect, useRef } from "react";

import { createUser, getUserByEmail } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/spinup");
  return json({});
};

type Errors = Record<"email" | "password" | "railwayToken", string | null>;
const badRequest = (errors: Errors) => {
  return json({ errors }, { status: 400 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const railwayToken = formData.get("railway-token");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/spinup");

  const errors: Errors = {
    email: null,
    password: null,
    railwayToken: null,
  };

  // TODO Might be good to use some kind of validator library here.
  if (!validateEmail(email)) {
    errors.email = "Email is invalid";
    return badRequest(errors);
  }

  if (typeof password !== "string" || password.length === 0) {
    errors.password = "Password is required";
    return badRequest(errors);
  }

  if (password.length < 8) {
    errors.password = "Password is too short";
    return badRequest(errors);
  }

  if (typeof railwayToken !== "string" || !railwayToken) {
    errors.railwayToken = "Railway token is required";
    return badRequest(errors);
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    errors.email = "A user already exists with this email";
    return badRequest(errors);
  }

  const user = await createUser(email, password, railwayToken);

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
  });
};

export const meta: MetaFunction = () => [{ title: "Sign Up" }];

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const railwayTokenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    } else if (actionData?.errors?.railwayToken) {
      railwayTokenRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                ref={emailRef}
                id="email"
                required
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.email ? (
                <div className="pt-1 text-red-700" id="email-error">
                  {actionData.errors.email}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-400"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.password ? (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <label
              htmlFor="railway-token"
              className="block text-sm font-medium text-gray-400"
            >
              Railway Token
              <p className="text-xs text-gray-400">
                Can't find your token? Check{" "}
                <a className="underline" href="https://docs.railway.app/guides/public-api#creating-a-token">
                  here
                </a>
              </p>
            </label>
            <div className="mt-1">
              <input
                id="railway-token"
                ref={railwayTokenRef}
                name="railway-token"
                type="password"
                aria-invalid={
                  actionData?.errors?.railwayToken ? true : undefined
                }
                aria-describedby="railway-token-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.railwayToken ? (
                <div className="pt-1 text-red-700" id="railway-token-error">
                  {actionData.errors.railwayToken}
                </div>
              ) : null}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Create Account
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
