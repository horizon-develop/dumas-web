"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../features/App"), { ssr: false });

export default function CatchAllPage() {
  return <App />;
}
