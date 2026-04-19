"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

interface CalendarEvent {
  id: string; title: string; description: string | null; date: string;
  startTime: string | null; endTime: string | null; location: string | null;
  category: string; allDay: boolean;
}

const CATEGORY_ICONS: Record<string, string> = { EVENT: "🎉", HOLIDAY: "🌸", HEALTH_CHECK: "🏥" };

export default function CalendarPage() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", startTime: "", endTime: "", location: "", category: "EVENT" });

  const monthStr = `${year}-${String(month).padStart(2, "0")}`;

  useEffect(() => {
    fetch(`/api/calendar?month=${monthStr}`).then(r => r.json()).then(setEvents);
  }, [monthStr]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1); };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/calendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    fetch(`/api/calendar?month=${monthStr}`).then(r => r.json()).then(setEvents);
  };

  if (!user) return null;

  const canEdit = user.role !== "PARENT";

  return (
    <div className="container-app py-6">
      <h1 className="page-header">📅 行事カレンダー</h1>

      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="btn btn-secondary !px-4">◀</button>
        <h2 className="text-lg font-bold">{year}年{month}月</h2>
        <button onClick={nextMonth} className="btn btn-secondary !px-4">▶</button>
      </div>

      {canEdit && <button onClick={() => setShowForm(true)} className="btn btn-primary mb-4 w-full sm:w-auto">行事を追加</button>}

      {/* Calendar Grid */}
      <div className="card mb-4 overflow-x-auto">
        <div className="grid grid-cols-7 gap-0 min-w-[320px]">
          {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
            <div key={d} className={`text-center text-xs font-semibold py-2 ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"}`}>{d}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = events.filter(e => e.date === dateStr);
            const isToday = dateStr === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            const dayOfWeek = new Date(year, month - 1, day).getDay();

            return (
              <div key={day} className={`min-h-[48px] p-1 border-t border-gray-100 ${isToday ? "bg-[var(--color-primary-light)]" : ""}`}>
                <span className={`text-xs font-medium ${dayOfWeek === 0 ? "text-red-500" : dayOfWeek === 6 ? "text-blue-500" : ""}`}>{day}</span>
                {dayEvents.map(ev => (
                  <div key={ev.id} className="text-[10px] bg-[var(--color-primary)] text-white rounded px-1 mt-0.5 truncate">{ev.title}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event List */}
      <h3 className="text-sm font-semibold text-gray-500 mb-2">{month}月の行事一覧</h3>
      <div className="space-y-2">
        {events.length === 0 ? <div className="card text-center text-gray-400 py-4">この月の行事はありません</div> :
          events.map(ev => (
            <div key={ev.id} className="card !p-3">
              <div className="flex items-center gap-2">
                <span>{CATEGORY_ICONS[ev.category] || "📌"}</span>
                <span className="font-semibold text-sm">{ev.title}</span>
                <span className="text-xs text-gray-400 ml-auto">{ev.date.split("-")[2]}日</span>
              </div>
              {ev.startTime && <p className="text-xs text-gray-500 mt-1">{ev.startTime}{ev.endTime ? ` ~ ${ev.endTime}` : ""}</p>}
              {ev.location && <p className="text-xs text-gray-400">📍 {ev.location}</p>}
              {ev.description && <p className="text-xs text-gray-600 mt-1">{ev.description}</p>}
            </div>
          ))
        }
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">行事を追加</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">タイトル</label><input className="input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><label className="label">日付</label><input className="input" type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">開始時間</label><input className="input" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
                <div><label className="label">終了時間</label><input className="input" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
              </div>
              <div><label className="label">場所</label><input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
              <div><label className="label">カテゴリ</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="EVENT">行事</option><option value="HOLIDAY">休園日</option><option value="HEALTH_CHECK">健康診断</option>
                </select>
              </div>
              <div><label className="label">詳細</label><textarea className="input min-h-[80px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
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
