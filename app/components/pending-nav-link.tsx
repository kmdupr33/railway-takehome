import { NavLink, useNavigation, useResolvedPath } from "@remix-run/react";
import { PropsWithChildren } from "react";

import LoadingIndicator from "./loading-indicator";

export default function PendingNavLink({
  key,
  children,
  to,
}: PropsWithChildren & { to: string; key: string | number; }) {
  const path = useResolvedPath(to);
  const navigation = useNavigation();
  // Rolling our own end-like prop described here: https://remix.run/docs/en/main/components/nav-link#end
  const end = path.pathname.length === navigation.location?.pathname.length;
  return (
    <NavLink key={key} className="lr-list-item" to={to}>
      {({ isPending }) => (
        <>
          {children}
          {isPending && end ? (
            <span className="ml-2">
              <LoadingIndicator black />
            </span>
          ) : (
            ""
          )}
        </>
      )}
    </NavLink>
  );
}
