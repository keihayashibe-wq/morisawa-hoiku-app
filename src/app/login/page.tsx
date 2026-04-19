"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100 px-4 !ml-0">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌳</div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">もりさわ保育園</h1>
          <p className="text-gray-500 mt-2">アプリにログイン</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="label">メールアドレス</label>
            <input
              type="email"
              className="input"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">パスワード</label>
            <input
              type="password"
              className="input"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full text-lg">
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className="mt-6 card">
          <p className="text-xs text-gray-500 mb-2 font-semibold">テストアカウント</p>
          <div className="space-y-1 text-xs text-gray-500">
            <p>管理者: admin@morisawa-hoiku.jp</p>
            <p>保育士: tanaka@morisawa-hoiku.jp</p>
            <p>保護者: yamada@example.com</p>
            <p>パスワード: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
