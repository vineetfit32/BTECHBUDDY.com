import { ViewTransition } from "react";

/** Re-mounts on every navigation, so the page content gets enter/exit view transitions while chrome stays put. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
