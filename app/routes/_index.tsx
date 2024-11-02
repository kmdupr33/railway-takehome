import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, Link, Outlet, redirect } from "@remix-run/react";
import { getUserId } from "~/session.server";

export const meta: MetaFunction = () => [
  { title: "Light Rail | An interview project by Matt Dupree" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/spinup/projects");
  return json({});
};

export default function Index() {
  return (
    <main className="relative min-h-screen sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative sm:overflow-hidden">
            <div className="relative px-4 pb-8 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-32">
              <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="block uppercase">Light Rail</span>
              </h1>
              <p className="mb-12 max-w-xl text-xl text-gray-500">
                An interview project by Matt Dupree
              </p>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                  <a href="/join" className="btn-secondary">
                    Sign up
                  </a>
                  <Link to="/login" className="btn-primary">
                    Log In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
