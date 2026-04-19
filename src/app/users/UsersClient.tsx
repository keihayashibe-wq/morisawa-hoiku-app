"use client";
import { useState } from "react";
interface UserRecord { id: string; email: string; name: string; role: string; phone: string | null; createdAt: string; }
const ROLE_LABELS: Record<string, string> = { ADMIN: "管理者", TEACHER: "保育士", PARENT: "保護者" };
const ROLE_COLORS: Record<string, string> = { ADMIN: "bg-purple-100 text-purple-700", TEACHER: "bg-green-100 text-green-700", PARENT: "bg-blue-100 text-blue-700" };
interface Props { user: { role: string }; initialUsers: UserRecord[]; }

export default function UsersClient({ user, initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "PARENT", phone: "" });
  const [error, setError] = useState("");
  const load = () => fetch("/api/users").then(r => r.json()).then(setUsers);

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setError(""); const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); if (!res.ok) { const data = await res.json(); setError(data.error); return; } setShowForm(false); setForm({ email: "", password: "", name: "", role: "PARENT", phone: "" }); load(); };

  return (
    <div className="container-app py-6">
      <h1 className="page-header">👤 ユーザー管理</h1>
      <button onClick={() => setShowForm(true)} className="btn btn-primary mb-4 w-full sm:w-auto">ユーザーを追加</button>
      <div className="space-y-3">{users.map(u => <div key={u.id} className="card flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">{u.name[0]}</div><div><p className="font-semibold text-sm">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div></div><span className={`badge ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span></div>)}</div>
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2 className="text-lg font-bold mb-4">ユーザーを追加</h2>
          {error && <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">名前</label><input className="input" required value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></div>
            <div><label className="label">メールアドレス</label><input className="input" type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></div>
            <div><label className="label">パスワード</label><input className="input" type="password" required minLength={6} value={form.password} onChange={e => setForm({...form,password:e.target.value})} /></div>
            <div><label className="label">役割</label><div className="flex gap-2">{Object.entries(ROLE_LABELS).map(([v,l]) => <button key={v} type="button" className={`tab flex-1 ${form.role===v?"active":""}`} onClick={() => setForm({...form,role:v})}>{l}</button>)}</div></div>
            <div><label className="label">電話番号</label><input className="input" type="tel" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} /></div>
            <div className="flex gap-3"><button type="submit" className="btn btn-primary flex-1">登録</button><button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">キャンセル</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}
