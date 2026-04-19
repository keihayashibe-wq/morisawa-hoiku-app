"use client";
import { useState } from "react";
interface Child { id: string; name: string; class: { name: string } | null; }
interface NapCheck { id: string; childId: string; date: string; time: string; position: string; breathing: string; notes: string | null; child: { name: string }; checkedBy: { name: string }; }
const POSITION_LABELS: Record<string, string> = { FACE_UP: "仰向け", FACE_DOWN: "うつ伏せ", LEFT: "左向き", RIGHT: "右向き" };
const BREATHING_LABELS: Record<string, string> = { NORMAL: "正常", IRREGULAR: "不規則" };
interface Props { user: { userId: string }; initialChildren: Child[]; initialChecks: NapCheck[]; initialDate: string; }

export default function NapCheckClient({ initialChildren, initialChecks, initialDate }: Props) {
  const [children] = useState(initialChildren);
  const [checks, setChecks] = useState(initialChecks);
  const [date, setDate] = useState(initialDate);
  const [showForm, setShowForm] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [form, setForm] = useState({ position: "FACE_UP", breathing: "NORMAL", notes: "" });

  const loadChecks = (d: string) => fetch(`/api/nap-check?date=${d}`).then(r => r.json()).then(setChecks);
  const handleDateChange = (d: string) => { setDate(d); loadChecks(d); };
  const handleQuickCheck = async (childId: string, position: string) => {
    const now = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    await fetch("/api/nap-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ childId, date, time: now, position, breathing: "NORMAL" }) });
    loadChecks(date);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); const now = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    await fetch("/api/nap-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ childId: selectedChildId, date, time: now, ...form }) });
    setShowForm(false); loadChecks(date);
  };

  return (
    <div className="container-app py-6">
      <h1 className="page-header">😴 午睡チェック</h1>
      <p className="text-xs text-gray-400 mb-4">SIDS予防のため、5分おきの呼吸確認を記録します</p>
      <div className="flex items-center gap-3 mb-4"><input type="date" className="input w-44" value={date} onChange={e => handleDateChange(e.target.value)} /></div>
      <h2 className="text-sm font-semibold text-gray-500 mb-2">クイックチェック</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">{children.map(child => {
        const lastCheck = checks.filter(c => c.childId === child.id).sort((a,b) => b.time.localeCompare(a.time))[0];
        return <div key={child.id} className="card !p-3">
          <div className="flex items-center justify-between mb-2"><div><span className="font-semibold text-sm">{child.name}</span>{lastCheck && <span className="text-xs text-gray-400 ml-2">最終: {lastCheck.time}</span>}</div><button onClick={() => { setSelectedChildId(child.id); setShowForm(true); }} className="text-xs text-[var(--color-primary)]">詳細入力</button></div>
          <div className="flex gap-1">{Object.entries(POSITION_LABELS).map(([v,l]) => <button key={v} onClick={() => handleQuickCheck(child.id, v)} className={`flex-1 text-xs py-2 rounded-lg transition ${v==="FACE_DOWN"?"bg-red-100 text-red-700 hover:bg-red-200":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{l}</button>)}</div>
        </div>;
      })}</div>
      <h2 className="text-sm font-semibold text-gray-500 mb-2">本日のチェック記録</h2>
      {checks.length === 0 ? <div className="card text-center text-gray-400 py-4">記録がありません</div> :
        <div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 px-2">時刻</th><th className="text-left py-2 px-2">園児</th><th className="text-left py-2 px-2">体位</th><th className="text-left py-2 px-2">呼吸</th><th className="text-left py-2 px-2">確認者</th></tr></thead><tbody>
          {checks.map(c => <tr key={c.id} className="border-b border-gray-50"><td className="py-2 px-2">{c.time}</td><td className="py-2 px-2">{c.child.name}</td><td className="py-2 px-2"><span className={c.position==="FACE_DOWN"?"text-red-600 font-semibold":""}>{POSITION_LABELS[c.position]}</span></td><td className="py-2 px-2"><span className={c.breathing==="IRREGULAR"?"text-red-600 font-semibold":"text-green-600"}>{BREATHING_LABELS[c.breathing]}</span></td><td className="py-2 px-2 text-gray-400">{c.checkedBy.name}</td></tr>)}
        </tbody></table></div>}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2 className="text-lg font-bold mb-4">午睡チェック詳細</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">体位</label><div className="grid grid-cols-2 gap-2">{Object.entries(POSITION_LABELS).map(([v,l]) => <button key={v} type="button" className={`tab ${form.position===v?"active":""}`} onClick={() => setForm({...form,position:v})}>{l}</button>)}</div></div>
            <div><label className="label">呼吸</label><div className="flex gap-2">{Object.entries(BREATHING_LABELS).map(([v,l]) => <button key={v} type="button" className={`tab flex-1 ${form.breathing===v?"active":""} ${v==="IRREGULAR"?"!bg-red-100 !text-red-700":""}`} onClick={() => setForm({...form,breathing:v})}>{l}</button>)}</div></div>
            <div><label className="label">備考</label><textarea className="input" value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} /></div>
            <div className="flex gap-3"><button type="submit" className="btn btn-primary flex-1">記録</button><button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">キャンセル</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}
