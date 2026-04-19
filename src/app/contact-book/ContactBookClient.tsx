"use client";

import { useState } from "react";

interface Child { id: string; name: string; }
interface ContactEntry {
  id: string; childId: string; date: string; child: { name: string }; author: { name: string; role: string };
  homeMood: string | null; homeTemp: number | null; homeMeal: string | null; homeSleep: string | null; homeBowel: string | null; homeNotes: string | null;
  schoolMood: string | null; schoolTemp: number | null; schoolMeal: string | null; schoolSleep: string | null; schoolBowel: string | null; schoolActivity: string | null; schoolNotes: string | null;
}
const MOOD_OPTIONS = [{ value: "GOOD", label: "😊 良い" }, { value: "NORMAL", label: "😐 普通" }, { value: "BAD", label: "😢 悪い" }];

interface Props { user: { userId: string; role: string; name: string }; initialChildren: Child[]; initialEntries: ContactEntry[]; initialDate: string; }

export default function ContactBookClient({ user, initialChildren, initialEntries, initialDate }: Props) {
  const [children] = useState(initialChildren);
  const [selectedChild, setSelectedChild] = useState(initialChildren[0]?.id || "");
  const [date, setDate] = useState(initialDate);
  const [entries, setEntries] = useState(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ homeMood: "", homeTemp: "", homeMeal: "", homeSleep: "", homeBowel: "", homeNotes: "", schoolMood: "", schoolTemp: "", schoolMeal: "", schoolSleep: "", schoolBowel: "", schoolActivity: "", schoolNotes: "" });

  const loadEntries = (cId: string, d: string) => fetch(`/api/contact-book?childId=${cId}&date=${d}`).then(r => r.json()).then(setEntries);

  const handleChildChange = (id: string) => { setSelectedChild(id); loadEntries(id, date); };
  const handleDateChange = (d: string) => { setDate(d); loadEntries(selectedChild, d); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/contact-book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ childId: selectedChild, date, ...form }) });
    setShowForm(false);
    loadEntries(selectedChild, date);
  };

  const isParent = user.role === "PARENT";

  return (
    <div className="container-app py-6">
      <h1 className="page-header">📖 連絡帳</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select className="input flex-1" value={selectedChild} onChange={e => handleChildChange(e.target.value)}>{children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input type="date" className="input sm:w-44" value={date} onChange={e => handleDateChange(e.target.value)} />
      </div>
      <button onClick={() => setShowForm(true)} className="btn btn-primary mb-4 w-full sm:w-auto">{isParent ? "家庭からの連絡を記入" : "園からの連絡を記入"}</button>
      {entries.length === 0 ? <div className="card text-center text-gray-400 py-8">この日の連絡帳はまだありません</div> :
        entries.map(entry => (
          <div key={entry.id} className="card mb-3">
            <div className="flex justify-between items-center mb-3"><span className="font-semibold">{entry.child.name}</span><span className="text-xs text-gray-400">{entry.author.name}（{entry.author.role === "PARENT" ? "保護者" : "保育士"}）</span></div>
            {(entry.homeMood || entry.homeTemp || entry.homeNotes) && (
              <div className="bg-orange-50 rounded-xl p-3 mb-2"><h3 className="text-sm font-semibold text-orange-700 mb-2">🏠 家庭から</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {entry.homeMood && <Info label="機嫌" value={MOOD_OPTIONS.find(m => m.value === entry.homeMood)?.label || entry.homeMood} />}
                  {entry.homeTemp && <Info label="体温" value={`${entry.homeTemp}℃`} />}
                  {entry.homeMeal && <Info label="食事" value={entry.homeMeal} />}
                  {entry.homeSleep && <Info label="睡眠" value={entry.homeSleep} />}
                  {entry.homeBowel && <Info label="排便" value={entry.homeBowel} />}
                </div>
                {entry.homeNotes && <p className="text-sm mt-2 text-gray-700">{entry.homeNotes}</p>}
              </div>
            )}
            {(entry.schoolMood || entry.schoolTemp || entry.schoolNotes) && (
              <div className="bg-green-50 rounded-xl p-3"><h3 className="text-sm font-semibold text-green-700 mb-2">🏫 園から</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {entry.schoolMood && <Info label="機嫌" value={MOOD_OPTIONS.find(m => m.value === entry.schoolMood)?.label || entry.schoolMood} />}
                  {entry.schoolTemp && <Info label="体温" value={`${entry.schoolTemp}℃`} />}
                  {entry.schoolMeal && <Info label="食事" value={entry.schoolMeal} />}
                  {entry.schoolSleep && <Info label="午睡" value={entry.schoolSleep} />}
                  {entry.schoolBowel && <Info label="排便" value={entry.schoolBowel} />}
                  {entry.schoolActivity && <Info label="活動" value={entry.schoolActivity} />}
                </div>
                {entry.schoolNotes && <p className="text-sm mt-2 text-gray-700">{entry.schoolNotes}</p>}
              </div>
            )}
          </div>
        ))
      }
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2 className="text-lg font-bold mb-4">{isParent ? "🏠 家庭からの連絡" : "🏫 園からの連絡"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isParent ? (<>
              <div><label className="label">機嫌</label><div className="flex gap-2">{MOOD_OPTIONS.map(m => <button key={m.value} type="button" className={`tab flex-1 ${form.homeMood === m.value ? "active" : ""}`} onClick={() => setForm({ ...form, homeMood: m.value })}>{m.label}</button>)}</div></div>
              <div><label className="label">体温 (℃)</label><input className="input" type="number" step="0.1" placeholder="36.5" value={form.homeTemp} onChange={e => setForm({ ...form, homeTemp: e.target.value })} /></div>
              <div><label className="label">食事</label><input className="input" placeholder="朝ごはんの内容" value={form.homeMeal} onChange={e => setForm({ ...form, homeMeal: e.target.value })} /></div>
              <div><label className="label">睡眠</label><input className="input" placeholder="例: 21時〜7時" value={form.homeSleep} onChange={e => setForm({ ...form, homeSleep: e.target.value })} /></div>
              <div><label className="label">排便</label><input className="input" placeholder="例: あり・普通" value={form.homeBowel} onChange={e => setForm({ ...form, homeBowel: e.target.value })} /></div>
              <div><label className="label">連絡事項</label><textarea className="input min-h-[100px]" placeholder="伝えたいことを記入" value={form.homeNotes} onChange={e => setForm({ ...form, homeNotes: e.target.value })} /></div>
            </>) : (<>
              <div><label className="label">機嫌</label><div className="flex gap-2">{MOOD_OPTIONS.map(m => <button key={m.value} type="button" className={`tab flex-1 ${form.schoolMood === m.value ? "active" : ""}`} onClick={() => setForm({ ...form, schoolMood: m.value })}>{m.label}</button>)}</div></div>
              <div><label className="label">体温 (℃)</label><input className="input" type="number" step="0.1" placeholder="36.5" value={form.schoolTemp} onChange={e => setForm({ ...form, schoolTemp: e.target.value })} /></div>
              <div><label className="label">食事</label><input className="input" placeholder="給食の食べ具合" value={form.schoolMeal} onChange={e => setForm({ ...form, schoolMeal: e.target.value })} /></div>
              <div><label className="label">午睡</label><input className="input" placeholder="例: 13時〜14時30分" value={form.schoolSleep} onChange={e => setForm({ ...form, schoolSleep: e.target.value })} /></div>
              <div><label className="label">排便</label><input className="input" placeholder="例: 1回・普通" value={form.schoolBowel} onChange={e => setForm({ ...form, schoolBowel: e.target.value })} /></div>
              <div><label className="label">活動内容</label><input className="input" placeholder="今日の主な活動" value={form.schoolActivity} onChange={e => setForm({ ...form, schoolActivity: e.target.value })} /></div>
              <div><label className="label">連絡事項</label><textarea className="input min-h-[100px]" placeholder="保護者への連絡" value={form.schoolNotes} onChange={e => setForm({ ...form, schoolNotes: e.target.value })} /></div>
            </>)}
            <div className="flex gap-3"><button type="submit" className="btn btn-primary flex-1">保存</button><button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">キャンセル</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><span className="text-gray-500">{label}: </span><span className="font-medium">{value}</span></div>;
}
