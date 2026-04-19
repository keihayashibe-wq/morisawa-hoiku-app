"use client";
import { useState } from "react";
interface ShiftRecord { id: string; teacherId: string; date: string; startTime: string; endTime: string; shiftType: string; notes: string | null; teacher: { id: string; name: string }; }
interface Teacher { id: string; name: string; }
const SHIFT_COLORS: Record<string, string> = { EARLY: "bg-yellow-100 text-yellow-800", NORMAL: "bg-green-100 text-green-800", LATE: "bg-blue-100 text-blue-800" };
const SHIFT_LABELS: Record<string, string> = { EARLY: "早番", NORMAL: "通常", LATE: "遅番" };
interface Props { user: { role: string }; initialShifts: ShiftRecord[]; initialTeachers: Teacher[]; initialYear: number; initialMonth: number; }

export default function ShiftsClient({ user, initialShifts, initialTeachers, initialYear, initialMonth }: Props) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [shifts, setShifts] = useState(initialShifts);
  const [teachers] = useState(initialTeachers);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ teacherId: "", date: "", startTime: "08:00", endTime: "17:00", shiftType: "NORMAL" });

  const loadShifts = (ms: string) => fetch(`/api/shifts?month=${ms}`).then(r => r.json()).then(setShifts);
  const prevMonth = () => { const m = month===1?12:month-1; const y = month===1?year-1:year; setMonth(m); setYear(y); loadShifts(`${y}-${String(m).padStart(2,"0")}`); };
  const nextMonth = () => { const m = month===12?1:month+1; const y = month===12?year+1:year; setMonth(m); setYear(y); loadShifts(`${y}-${String(m).padStart(2,"0")}`); };

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); await fetch("/api/shifts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); setShowForm(false); loadShifts(`${year}-${String(month).padStart(2,"0")}`); };

  const groupedByDate = shifts.reduce((acc, s) => { if (!acc[s.date]) acc[s.date] = []; acc[s.date].push(s); return acc; }, {} as Record<string, ShiftRecord[]>);

  return (
    <div className="container-app py-6">
      <h1 className="page-header">📋 シフト管理</h1>
      <div className="flex items-center justify-between mb-4"><button onClick={prevMonth} className="btn btn-secondary !px-4">◀</button><h2 className="text-lg font-bold">{year}年{month}月</h2><button onClick={nextMonth} className="btn btn-secondary !px-4">▶</button></div>
      {user.role === "ADMIN" && <button onClick={() => setShowForm(true)} className="btn btn-primary mb-4 w-full sm:w-auto">シフトを登録</button>}
      {Object.keys(groupedByDate).length === 0 ? <div className="card text-center text-gray-400 py-8">この月のシフトはありません</div> :
        Object.entries(groupedByDate).sort(([a],[b]) => a.localeCompare(b)).map(([date, dayShifts]) => <div key={date} className="card mb-3"><h3 className="font-semibold text-sm mb-2">{date.split("-")[2]}日</h3><div className="space-y-2">{dayShifts.map(s => <div key={s.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"><div className="flex items-center gap-2"><span className={`badge ${SHIFT_COLORS[s.shiftType]}`}>{SHIFT_LABELS[s.shiftType]}</span><span className="font-medium text-sm">{s.teacher.name}</span></div><span className="text-sm text-gray-500">{s.startTime} ~ {s.endTime}</span></div>)}</div></div>)
      }
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2 className="text-lg font-bold mb-4">シフトを登録</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">保育士</label><select className="input" value={form.teacherId} onChange={e => setForm({...form,teacherId:e.target.value})}><option value="">選択してください</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            <div><label className="label">日付</label><input className="input" type="date" required value={form.date} onChange={e => setForm({...form,date:e.target.value})} /></div>
            <div><label className="label">シフト種類</label><div className="flex gap-2">{Object.entries(SHIFT_LABELS).map(([v,l]) => <button key={v} type="button" className={`tab flex-1 ${form.shiftType===v?"active":""}`} onClick={() => { const times: Record<string,[string,string]> = { EARLY:["07:00","16:00"], NORMAL:["08:00","17:00"], LATE:["10:00","19:00"] }; setForm({...form,shiftType:v,startTime:times[v][0],endTime:times[v][1]}); }}>{l}</button>)}</div></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="label">開始</label><input className="input" type="time" value={form.startTime} onChange={e => setForm({...form,startTime:e.target.value})} /></div><div><label className="label">終了</label><input className="input" type="time" value={form.endTime} onChange={e => setForm({...form,endTime:e.target.value})} /></div></div>
            <div className="flex gap-3"><button type="submit" className="btn btn-primary flex-1">登録</button><button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">キャンセル</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}
