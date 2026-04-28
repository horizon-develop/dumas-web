import { Suspense } from "react";
import Login from "@/features/auth/components/Login";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff5f5] via-white to-[#fff0f0] flex items-center justify-center p-4">
      <Suspense>
        <Login />
      </Suspense>
    </main>
  );
}
