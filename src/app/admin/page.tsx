import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { isAdmin } from "@/lib/auth";
import { adminMocks } from "@/lib/store";
import { LoginForm } from "@/components/admin/LoginForm";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdmin();

  if (!authed) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
            <h1 className="font-display text-2xl font-bold text-zinc-900">Admin</h1>
            <p className="mt-1 text-sm text-zinc-500">Enter the admin password to continue.</p>
            <LoginForm />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const mocks = await adminMocks();
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <h1 className="mb-6 font-display text-2xl font-bold text-zinc-900">Admin</h1>
          <AdminPanel mocks={mocks} />
        </div>
      </main>
      <Footer />
    </>
  );
}
