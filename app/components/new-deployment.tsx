import { useFetcher } from "@remix-run/react";
import LoadingIndicator from "./loading-indicator";

export default function NewDeployment() {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post">
      <button
        className="btn-primary"
        type="submit"
        disabled={fetcher.state !== "idle"}
      >
        {fetcher.state !== "idle" && <LoadingIndicator />}
        Create New Deploy
      </button>
    </fetcher.Form>
  );
}

