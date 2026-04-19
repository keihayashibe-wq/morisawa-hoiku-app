"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Broadcast {
  id: string; title: string; content: string; severity: string;
  isActive: boolean; createdAt: string;
  author: { name: string };
}

const SEVERITY_CONFIG: Record<string, { label: string; bg: string; border: string; icon: string }> = {
  INFO: { label: "情報", bg: "bg-blue-50", border: "border-blue-500", icon: "ℹ️" },
  WARNING: { label: "警告", bg: "bg-yellow-50", border: "border-yellow-500", icon: "⚠️" },
  CRITICAL: { label: "緊急", bg: "bg-red-50", border: "border-red-500", icon: "🚨" },
};

export default function BroadcastPage() {
  const { user } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", severity: "WARNING" });

  const load = () => fetch("/api/broadcast").then(r => r.json()).then(setBroadcasts);
  useEffect(() => { if (user) load(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/broadcast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ title: "", content: "", severity: "WARNING" });
    load();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch("/api/broadcast", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isActive: !isActive }) });
    load();
  };

  if (!user) return null;
  const canEdit = user.role !== "PARENT";

  return (
    <div className="container-app py-6">
      <h1 className="page-header">🚨 緊急一斉連絡</h1>

      {canEdit && (
        <button onClick={() => setShowForm(true)} className="btn btn-danger mb-4 w-full sm:w-auto">緊急連絡を配信</button>
      )}

      <div className="space-y-3">
        {broadcasts.map(b => {
          const config = SEVERITY_CONFIG[b.severity] || SEVERITY_CONFIG.INFO;
          return (
            <div key={b.id} className={`card border-l-4 ${config.border} ${b.isActive ? config.bg : "opacity-60"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{config.icon}</span>
                  <span className={`badge ${b.severity === "CRITICAL" ? "bg-red-100 text-red-700" : b.severity === "WARNING" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                    {config.label}
                  </span>
                  {b.isActive && <span className="badge bg-green-100 text-green-700">配信中</span>}
                </div>
                {canEdit && (
                  <button onClick={() => toggleActive(b.id, b.isActive)} className={`btn text-xs !px-3 !py-1 !min-h-0 ${b.isActive ? "btn-secondary" : "btn-danger"}`}>
                    {b.isActive ? "解除" : "再配信"}
                  </button>
                )}
              </div>
              <h3 className="font-bold mb-1">{b.title}</h3>
              <p className="text-sm">{b.content}</p>
              <p className="text-xs text-gray-400 mt-2">{b.author.name} · {new Date(b.createdAt).toLocaleString("ja-JP")}</p>
            </div>
          );
        })}
        {broadcasts.length === 0 && <div className="card text-center text-gray-400 py-8">緊急連絡はありません</div>}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">🚨 緊急連絡を配信</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">緊急度</label>
                <div className="flex gap-2">
                  {Object.entries(SEVERITY_CONFIG).map(([v, c]) => (
                    <button key={v} type="button" className={`tab flex-1 ${form.severity === v ? "active" : ""}`} onClick={() => setForm({ ...form, severity: v })}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="label">タイトル</label><input className="input" required placeholder="例: 大雨による臨時休園のお知らせ" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><label className="label">内容</label><textarea className="input min-h-[120px]" required placeholder="詳細な情報をお伝えください" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-danger flex-1">配信する</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">キャンセル</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
