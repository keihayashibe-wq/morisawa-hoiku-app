"use client";

import { useState } from "react";
import { getTodayString } from "@/lib/utils";

interface Child { id: string; name: string; }
interface AbsenceReport { id: string; childId: string; date: string; type: string; reason: string | null; arrivalTime: string | null; pickupTime: string | null; confirmed: boolean; child: { name: string }; parent: { name: string }; }

const TYPE_LABELS: Record<string, string> = { ABSENT: "欠席", LATE: "遅刻", EARLY_PICKUP: "早退" };
const TYPE_COLORS: Record<string, string> = { ABSENT: "bg-red-100 text-red-700", LATE: "bg-yellow-100 text-yellow-700", EARLY_PICKUP: "bg-orange-100 text-orange-700" };

interface Props { user: { userId: string; role: string; name: string }; initialChildren: Child[]; initialReports: AbsenceReport[]; }

export default function AbsenceClient({ user, initialChildren, initialReports }: Props) {
  const [children] = useState(initialChildren);
  const [reports, setReports] = useState(initialReports);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ childId: initialChildren[0]?.id || "", date: getTodayString(), type: "ABSENT", reason: "", arrivalTime: "", pickupTime: "" });

  const load = () => fetch("/api/absence").then(r => r.json()).then(setReports);

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); await fetch("/api/absence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); setShowForm(false); load(); };
  const handleConfirm = async (id: string) => { await fetch("/api/absence", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, confirmed: true }) }); load(); };

  return (
    <div className="container-app py-6">
      <h1 className="page-header">📝 欠席・遅刻連絡</h1>
      {user.role === "PARENT" && <button onClick={() => setShowForm(true)} className="btn btn-primary mb-4 w-full sm:w-auto">欠席・遅刻を連絡する</button>}
      {reports.length === 0 ? <div className="card text-center text-gray-400 py-8">連絡はありません</div> :
        <div className="space-y-3">{reports.map(r => (
          <div key={r.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><span className={`badge ${TYPE_COLORS[r.type]}`}>{TYPE_LABELS[r.type]}</span><span className="font-semibold">{r.child.name}</span></div>
              {r.confirmed ? <span className="badge bg-green-100 text-green-700">確認済</span> : user.role !== "PARENT" ? <button onClick={() => handleConfirm(r.id)} className="btn btn-primary text-xs !px-3 !py-1 !min-h-0">確認する</button> : <span className="badge bg-gray-100 text-gray-500">未確認</span>}
            </div>
            <p className="text-sm text-gray-500">{r.date} · {r.parent.name}</p>
            {r.reason && <p className="text-sm mt-1">{r.reason}</p>}
            {r.arrivalTime && <p className="text-xs text-gray-400">到着予定: {r.arrivalTime}</p>}
            {r.pickupTime && <p className="text-xs text-gray-400">お迎え予定: {r.pickupTime}</p>}
          </div>
        ))}</div>
      }
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2 className="text-lg font-bold mb-4">欠席・遅刻連絡</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">園児</label><select className="input" value={form.childId} onChange={e => setForm({ ...form, childId: e.target.value })}>{children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="label">日付</label><input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><label className="label">種類</label><div className="flex gap-2">{Object.entries(TYPE_LABELS).map(([v, l]) => <button key={v} type="button" className={`tab flex-1 ${form.type === v ? "active" : ""}`} onClick={() => setForm({ ...form, type: v })}>{l}</button>)}</div></div>
            <div><label className="label">理由</label><textarea className="input min-h-[80px]" placeholder="体調不良、通院など" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
            {form.type === "LATE" && <div><label className="label">到着予定時刻</label><input className="input" type="time" value={form.arrivalTime} onChange={e => setForm({ ...form, arrivalTime: e.target.value })} /></div>}
            {form.type === "EARLY_PICKUP" && <div><label className="label">お迎え予定時刻</label><input className="input" type="time" value={form.pickupTime} onChange={e => setForm({ ...form, pickupTime: e.target.value })} /></div>}
            <div className="flex gap-3"><button type="submit" className="btn btn-primary flex-1">送信</button><button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">キャンセル</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}
