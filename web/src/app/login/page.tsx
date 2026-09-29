import type { Metadata } from "next";
import { LuSchool } from "react-icons/lu";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "ចូលប្រើប្រាស់ | School Admin" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-brand text-white">
            <LuSchool size={28} />
          </div>
          <h1 className="text-xl font-semibold">School Admin</h1>
          <p className="mt-1 text-sm text-slate-500">ចូលប្រើប្រាស់គណនី admin របស់អ្នក</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
