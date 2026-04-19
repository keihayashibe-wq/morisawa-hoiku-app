"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getTodayString } from "@/lib/utils";

interface Child { id: string; name: string; }
interface HealthRecord {
  id: string; childId: string; date: string;
  temperature: number | null; weight: number | null; height: number | null;
  symptoms: string | null; notes: string | null;
  child: { name: string }; recordedBy: { name: string };
}

export default function HealthPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ childId: "", date: getTodayString(), temperature: "", weight: "", height: "", symptoms: "", notes: "" });

  useEffect(() => {
    fetch("/api/children").then(r => r.json()).then(c => {
      setChildren(c);
      if (c.length) { setSelectedChild(c[0].id); setForm(f => ({ ...f, childId: c[0].id })); }
    });
  }, []);

  useEffect(() => {
    const url = selectedChild ? `/api/health?childId=${selectedChild}` : "/api/health";
    fetch(url).then(r => r.json()).then(setRecords);
  }, [selectedChild]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/health", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    fetch(`/api/health?childId=${selectedChild}`).then(r => r.json()).then(setRecords);
  };

  if (!user) return null;
  const canEdit = user.role !== "PARENT";

  return (
    <div className="container-app py-6">
      <h1 className="page-header">🌡️ 健康記録</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select className="input flex-1" value={selectedChild} onChange={e => { setSelectedChild(e.target.value); setForm(f => ({ ...f, childId: e.target.value })); }}>
          <option value="">全園児</option>
          {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {canEdit && <button onClick={() => setShowForm(true)} className="btn btn-primary">記録を追加</button>}
      </div>

      {records.length === 0 ? (
        <div className="card text-center text-gray-400 py-8">健康記録はありません</div>
      ) : (
        <div className="space-y-3">
          {records.map(r => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{r.child.name}</span>
                <span className="text-xs text-gray-400">{r.date}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {r.temperature && (
                  <div className={`rounded-xl p-2 text-center ${r.temperature >= 37.5 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                    <div className="text-xs text-gray-500">体温</div>
                    <div className="font-bold">{r.temperature}℃</div>
                  </div>
                )}
                {r.weight && (
                  <div className="bg-blue-50 text-blue-700 rounded-xl p-2 text-center">
                    <div className="text-xs text-gray-500">体重</div>
                    <div className="font-bold">{r.weight}kg</div>
                  </div>
                )}
                {r.height && (
                  <div className="bg-purple-50 text-purple-700 rounded-xl p-2 text-center">
                    <div className="text-xs text-gray-500">身長</div>
                    <div className="font-bold">{r.height}cm</div>
                  </div>
                )}
              </div>
              {r.symptoms && <p className="text-sm mt-2"><span className="text-gray-500">症状:</span> {r.symptoms}</p>}
              {r.notes && <p className="text-xs text-gray-500 mt-1">{r.notes}</p>}
              <p className="text-xs text-gray-400 mt-1">記録: {r.recordedBy.name}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">健康記録を追加</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">園児</label><select className="input" value={form.childId} onChange={e => setForm({ ...form, childId: e.target.value })}>{children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="label">日付</label><input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><label className="label">体温 (℃)</label><input className="input" type="number" step="0.1" placeholder="36.5" value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">体重 (kg)</label><input className="input" type="number" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></div>
                <div><label className="label">身長 (cm)</label><input className="input" type="number" step="0.1" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} /></div>
              </div>
              <div><label className="label">症状</label><input className="input" placeholder="発熱、咳、鼻水など" value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} /></div>
              <div><label className="label">備考</label><textarea className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">保存</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">キャンセル</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
