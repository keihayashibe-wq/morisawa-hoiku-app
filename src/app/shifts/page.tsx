"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

interface ShiftRecord {
  id: string; teacherId: string; date: string; startTime: string; endTime: string;
  shiftType: string; notes: string | null;
  teacher: { id: string; name: string };
}

interface Teacher { id: string; name: string; }

const SHIFT_COLORS: Record<string, string> = {
  EARLY: "bg-yellow-100 text-yellow-800",
  NORMAL: "bg-green-100 text-green-800",
  LATE: "bg-blue-100 text-blue-800",
};
const SHIFT_LABELS: Record<string, string> = { EARLY: "早番", NORMAL: "通常", LATE: "遅番" };

export default function ShiftsPage() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ teacherId: "", date: "", startTime: "08:00", endTime: "17:00", shiftType: "NORMAL" });

  const monthStr = `${year}-${String(month).padStart(2, "0")}`;

  useEffect(() => { fetch(`/api/shifts?month=${monthStr}`).then(r => r.json()).then(setShifts); }, [monthStr]);
  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetch("/api/users").then(r => r.json()).then((users: Teacher[]) => setTeachers(users.filter((u: { id: string; name: string; role?: string }) => (u as { role?: string }).role === "TEACHER")));
    }
  }, [user]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/shifts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    fetch(`/api/shifts?month=${monthStr}`).then(r => r.json()).then(setShifts);
  };

  if (!user || user.role === "PARENT") return <div className="container-app py-6"><div className="card text-center text-gray-400 py-8">このページは保育士・管理者専用です</div></div>;

  const groupedByDate = shifts.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {} as Record<string, ShiftRecord[]>);

  return (
    <div className="container-app py-6">
      <h1 className="page-header">📋 シフト管理</h1>

      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="btn btn-secondary !px-4">◀</button>
        <h2 className="text-lg font-bold">{year}年{month}月</h2>
        <button onClick={nextMonth} className="btn btn-secondary !px-4">▶</button>
      </div>

      {user.role === "ADMIN" && <button onClick={() => setShowForm(true)} className="btn btn-primary mb-4 w-full sm:w-auto">シフトを登録</button>}

      {Object.keys(groupedByDate).length === 0 ? (
        <div className="card text-center text-gray-400 py-8">この月のシフトはありません</div>
      ) : (
        Object.entries(groupedByDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, dayShifts]) => (
          <div key={date} className="card mb-3">
            <h3 className="font-semibold text-sm mb-2">{date.split("-")[2]}日</h3>
            <div className="space-y-2">
              {dayShifts.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${SHIFT_COLORS[s.shiftType]}`}>{SHIFT_LABELS[s.shiftType]}</span>
                    <span className="font-medium text-sm">{s.teacher.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{s.startTime} ~ {s.endTime}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">シフトを登録</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">保育士</label><select className="input" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}><option value="">選択してください</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
              <div><label className="label">日付</label><input className="input" type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div>
                <label className="label">シフト種類</label>
                <div className="flex gap-2">
                  {Object.entries(SHIFT_LABELS).map(([v, l]) => (
                    <button key={v} type="button" className={`tab flex-1 ${form.shiftType === v ? "active" : ""}`} onClick={() => {
                      const times: Record<string, [string, string]> = { EARLY: ["07:00", "16:00"], NORMAL: ["08:00", "17:00"], LATE: ["10:00", "19:00"] };
                      setForm({ ...form, shiftType: v, startTime: times[v][0], endTime: times[v][1] });
                    }}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">開始</label><input className="input" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
                <div><label className="label">終了</label><input className="input" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">登録</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">キャンセル</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
