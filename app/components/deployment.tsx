import { useFetcher } from "@remix-run/react";
import LoadingIndicator from "./loading-indicator";
import NewDeployment from "./new-deployment";

export function Deployment({ id, status, current = false }) {
  const fetcher = useFetcher();
  return (
    <div className="lr-list-item">
      <p>DeploymentID: {id}</p>
      <div className="flex flex-row items-center space-x-2">
        <p>Deploymenet Status: {status} </p>
        {!["REMOVED", "FAILED", "SUCCESS", "CRASHED"].includes(status) && (
          <LoadingIndicator black />
        )}
      </div>

      {current && (
        <div className="mt-2 flex flex-row space-x-4">
          {status !== "REMOVED" && (
            <fetcher.Form method="delete">
              <input type="hidden" name="deploymentId" value={id} />
              <button
                type="submit"
                disabled={fetcher.state !== "idle"}
                className="disabled:opacity-50; flex h-[42px] transform items-center justify-center space-x-3 rounded-md border border-red-500 bg-red-500 px-3 py-2 text-base leading-6 text-white transition-transform duration-75 hover:border-red-600 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed"
              >
                {fetcher.state !== "idle" && <LoadingIndicator />}
                Remove
              </button>
            </fetcher.Form>
          )}
          <NewDeployment />
        </div>
      )}
    </div>
  );
}
