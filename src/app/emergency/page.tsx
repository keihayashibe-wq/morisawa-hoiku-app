"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Child { id: string; name: string; }
interface EmergencyContact { id: string; childId: string; name: string; relation: string; phone: string; priority: number; child: { name: string }; }
interface PickupPerson { id: string; childId: string; name: string; relation: string; phone: string | null; child: { name: string }; }

export default function EmergencyPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"contacts" | "pickup">("contacts");
  const [children, setChildren] = useState<Child[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [pickupPersons, setPickupPersons] = useState<PickupPerson[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ childId: "", name: "", relation: "", phone: "", priority: 1 });

  useEffect(() => {
    fetch("/api/children").then(r => r.json()).then(c => { setChildren(c); if (c.length) setForm(f => ({ ...f, childId: c[0].id })); });
    fetch("/api/emergency-contacts").then(r => r.json()).then(setContacts);
    fetch("/api/pickup-persons").then(r => r.json()).then(setPickupPersons);
  }, []);

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = tab === "contacts" ? "/api/emergency-contacts" : "/api/pickup-persons";
    await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    if (tab === "contacts") { fetch("/api/emergency-contacts").then(r => r.json()).then(setContacts); }
    else { fetch("/api/pickup-persons").then(r => r.json()).then(setPickupPersons); }
  };

  if (!user) return null;

  return (
    <div className="container-app py-6">
      <h1 className="page-header">🆘 緊急連絡先・お迎え者</h1>

      <div className="flex gap-2 mb-4">
        <button className={`tab ${tab === "contacts" ? "active" : ""}`} onClick={() => setTab("contacts")}>緊急連絡先</button>
        <button className={`tab ${tab === "pickup" ? "active" : ""}`} onClick={() => setTab("pickup")}>お迎え者</button>
      </div>

      <button onClick={() => setShowForm(true)} className="btn btn-primary mb-4 w-full sm:w-auto">
        {tab === "contacts" ? "連絡先を追加" : "お迎え者を追加"}
      </button>

      {tab === "contacts" ? (
        contacts.length === 0 ? <div className="card text-center text-gray-400 py-8">緊急連絡先が登録されていません</div> :
        <div className="space-y-3">
          {contacts.map(c => (
            <div key={c.id} className="card flex items-center justify-between">
              <div>
                <p className="font-semibold">{c.name}<span className="text-xs text-gray-400 ml-2">({c.relation})</span></p>
                <p className="text-sm text-gray-500">{c.child.name}の緊急連絡先</p>
                <p className="text-xs text-gray-400">優先度: {c.priority}</p>
              </div>
              <a href={`tel:${c.phone}`} className="btn btn-primary !rounded-full !p-3 text-lg">📞</a>
            </div>
          ))}
        </div>
      ) : (
        pickupPersons.length === 0 ? <div className="card text-center text-gray-400 py-8">お迎え者が登録されていません</div> :
        <div className="space-y-3">
          {pickupPersons.map(p => (
            <div key={p.id} className="card">
              <p className="font-semibold">{p.name}<span className="text-xs text-gray-400 ml-2">({p.relation})</span></p>
              <p className="text-sm text-gray-500">{p.child.name}</p>
              {p.phone && <a href={`tel:${p.phone}`} className="text-sm text-[var(--color-primary)]">📞 {p.phone}</a>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{tab === "contacts" ? "緊急連絡先を追加" : "お迎え者を追加"}</h2>
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div><label className="label">園児</label><select className="input" value={form.childId} onChange={e => setForm({ ...form, childId: e.target.value })}>{children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="label">名前</label><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">続柄</label><input className="input" required placeholder="父、母、祖父母など" value={form.relation} onChange={e => setForm({ ...form, relation: e.target.value })} /></div>
              <div><label className="label">電話番号</label><input className="input" type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              {tab === "contacts" && <div><label className="label">優先度</label><input className="input" type="number" min="1" value={form.priority} onChange={e => setForm({ ...form, priority: parseInt(e.target.value) })} /></div>}
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
