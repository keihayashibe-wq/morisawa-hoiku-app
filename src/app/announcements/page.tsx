"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Announcement {
  id: string; title: string; content: string; category: string; targetRole: string;
  pinned: boolean; createdAt: string;
  author: { name: string; role: string };
  readReceipts: Array<{ userId: string }>;
  _count: { readReceipts: number };
}

const CATEGORY_LABELS: Record<string, string> = { GENERAL: "一般", IMPORTANT: "重要", EVENT: "行事" };
const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: "bg-gray-100 text-gray-700",
  IMPORTANT: "bg-red-100 text-red-700",
  EVENT: "bg-blue-100 text-blue-700",
};

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "GENERAL", targetRole: "ALL", pinned: false });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => fetch("/api/announcements").then(r => r.json()).then(setAnnouncements);
  useEffect(() => { if (user) load(); }, [user]);

  const markRead = async (id: string) => {
    await fetch("/api/announcements/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ announcementId: id }) });
    load();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ title: "", content: "", category: "GENERAL", targetRole: "ALL", pinned: false });
    load();
  };

  if (!user) return null;

  const canPost = user.role !== "PARENT";

  return (
    <div className="container-app py-6">
      <h1 className="page-header">📢 お知らせ</h1>

      {canPost && (
        <button onClick={() => setShowForm(true)} className="btn btn-primary mb-4 w-full sm:w-auto">お知らせを作成</button>
      )}

      <div className="space-y-3">
        {announcements.map(a => {
          const isRead = a.readReceipts.some(r => r.userId === user.userId);
          const isExpanded = expandedId === a.id;
          return (
            <div key={a.id} className={`card cursor-pointer transition ${!isRead ? "border-l-4 border-[var(--color-primary)]" : ""}`}
              onClick={() => { setExpandedId(isExpanded ? null : a.id); if (!isRead) markRead(a.id); }}>
              <div className="flex items-center gap-2 mb-1">
                {a.pinned && <span className="text-sm">📌</span>}
                <span className={`badge ${CATEGORY_COLORS[a.category]}`}>{CATEGORY_LABELS[a.category]}</span>
                {!isRead && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
              </div>
              <h3 className="font-semibold mb-1">{a.title}</h3>
              <p className="text-xs text-gray-400">{a.author.name} · {new Date(a.createdAt).toLocaleDateString("ja-JP")}</p>
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm whitespace-pre-wrap">{a.content}</p>
                  {canPost && <p className="text-xs text-gray-400 mt-2">既読: {a._count.readReceipts}名</p>}
                </div>
              )}
            </div>
          );
        })}
        {announcements.length === 0 && <div className="card text-center text-gray-400 py-8">お知らせはありません</div>}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">お知らせを作成</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">タイトル</label><input className="input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><label className="label">内容</label><textarea className="input min-h-[120px]" required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
              <div>
                <label className="label">カテゴリ</label>
                <div className="flex gap-2">
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                    <button key={v} type="button" className={`tab flex-1 ${form.category === v ? "active" : ""}`} onClick={() => setForm({ ...form, category: v })}>{l}</button>
                  ))}
                </div>
              </div>
              <div><label className="label">対象</label>
                <select className="input" value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}>
                  <option value="ALL">全員</option><option value="PARENT">保護者のみ</option><option value="TEACHER">保育士のみ</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} className="w-5 h-5 rounded" />
                <span className="text-sm">固定表示する</span>
              </label>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">投稿</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">キャンセル</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
