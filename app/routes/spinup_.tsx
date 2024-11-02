import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { getProjectListItems } from "~/models/railway.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const projectListItems = await getProjectListItems({ userId });
  return json({ projectListItems: projectListItems });
};

function Navbar() {
  return (
    <div className="relative z-10 border border-gray-100 bg-transparent px-6">
      <header className="flex items-center justify-between py-3 md:h-[60px] md:py-0">
        <h1 className="w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-left font-medium">
          Light Rail
        </h1>
        <Form method="post" action="/logout">
          <button
            className="flex h-[34px] transform items-center justify-center space-x-2 rounded-md border border-transparent bg-transparent px-3 py-1.5 text-sm leading-5 text-red-500 transition-transform duration-75 hover:border-red-100 hover:bg-red-100 focus:outline-none focus-visible:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-600 active:scale-95"
            type="submit"
          >
            <span className="inline-block">Logout</span>
            <div
              className="icon-container icon-md !h-4 !w-4 text-2xl text-red-500"
              aria-hidden="true"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="feather feather-power"
              >
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"></path>
              </svg>
            </div>
          </button>
        </Form>
      </header>
      <div className="-mx-6">
        <hr className="my-0 w-full border-t border-gray-100" />
      </div>
    </div>
  );
}

export default function SpinupWizard() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-12 pt-4">
        <h1 className="text-3xl font-medium">Time to spin up a container!</h1>
        <p>First, pick a project:</p>
        <hr className="mb-2" />
        <div className="relative h-full rounded-lg bg-[hsl(0,0%,98%)] p-6 hover:bg-gray-100">
          {data.projectListItems.map(({ name, id }, i) => (
            <Link key={i} to={`projects/${id}/environments`}>
              Name: {name} ID: {id}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
