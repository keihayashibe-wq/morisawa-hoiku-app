"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Allergy { id: string; allergen: string; severity: string; notes: string | null; }
interface Child {
  id: string; name: string; nameKana: string | null; birthDate: string; gender: string | null;
  bloodType: string | null; notes: string | null;
  class: { name: string } | null;
  allergies: Allergy[];
  parents: Array<{ relation: string; parent: { name: string; phone: string | null } }>;
}

const SEVERITY_LABELS: Record<string, string> = { MILD: "軽度", MODERATE: "中度", SEVERE: "重度" };
const SEVERITY_COLORS: Record<string, string> = {
  MILD: "bg-yellow-100 text-yellow-700",
  MODERATE: "bg-orange-100 text-orange-700",
  SEVERE: "bg-red-100 text-red-700",
};

export default function ChildrenPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", nameKana: "", birthDate: "", gender: "", classId: "", bloodType: "" });

  useEffect(() => { fetch("/api/children").then(r => r.json()).then(setChildren); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/children", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    fetch("/api/children").then(r => r.json()).then(setChildren);
  };

  if (!user) return null;

  const canEdit = user.role !== "PARENT";

  return (
    <div className="container-app py-6">
      <h1 className="page-header">👶 {user.role === "PARENT" ? "お子さま情報" : "園児管理"}</h1>

      {canEdit && <button onClick={() => setShowForm(true)} className="btn btn-primary mb-4 w-full sm:w-auto">園児を登録</button>}

      {selectedChild ? (
        <div>
          <button onClick={() => setSelectedChild(null)} className="btn btn-secondary mb-4">← 一覧に戻る</button>
          <div className="card mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-2xl">👶</div>
              <div>
                <h2 className="text-xl font-bold">{selectedChild.name}</h2>
                {selectedChild.nameKana && <p className="text-sm text-gray-400">{selectedChild.nameKana}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">生年月日:</span> <span className="font-medium">{selectedChild.birthDate}</span></div>
              <div><span className="text-gray-500">性別:</span> <span className="font-medium">{selectedChild.gender || "未設定"}</span></div>
              <div><span className="text-gray-500">クラス:</span> <span className="font-medium">{selectedChild.class?.name || "未配属"}</span></div>
              <div><span className="text-gray-500">血液型:</span> <span className="font-medium">{selectedChild.bloodType || "未設定"}</span></div>
            </div>
          </div>

          {selectedChild.allergies.length > 0 && (
            <div className="card mb-4">
              <h3 className="font-semibold mb-2">⚠️ アレルギー情報</h3>
              <div className="space-y-2">
                {selectedChild.allergies.map(a => (
                  <div key={a.id} className="bg-red-50 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{a.allergen}</span>
                      <span className={`badge ${SEVERITY_COLORS[a.severity]}`}>{SEVERITY_LABELS[a.severity]}</span>
                    </div>
                    {a.notes && <p className="text-xs text-gray-600 mt-1">{a.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedChild.parents.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-2">👨‍👩‍👧 保護者情報</h3>
              <div className="space-y-2">
                {selectedChild.parents.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                    <div>
                      <span className="font-medium">{p.parent.name}</span>
                      <span className="text-xs text-gray-400 ml-2">({p.relation})</span>
                    </div>
                    {p.parent.phone && <a href={`tel:${p.parent.phone}`} className="text-[var(--color-primary)]">📞</a>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {children.map(child => (
            <div key={child.id} className="card cursor-pointer hover:shadow-md transition" onClick={() => setSelectedChild(child)}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-xl">👶</div>
                <div className="flex-1">
                  <p className="font-semibold">{child.name}</p>
                  <p className="text-xs text-gray-400">{child.class?.name || "未配属"} · {child.birthDate}</p>
                </div>
                {child.allergies.length > 0 && <span className="badge bg-red-100 text-red-700">アレルギー有</span>}
                <span className="text-gray-300">▶</span>
              </div>
            </div>
          ))}
          {children.length === 0 && <div className="card text-center text-gray-400 py-8">園児が登録されていません</div>}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">園児を登録</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">名前</label><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">ふりがな</label><input className="input" value={form.nameKana} onChange={e => setForm({ ...form, nameKana: e.target.value })} /></div>
              <div><label className="label">生年月日</label><input className="input" type="date" required value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} /></div>
              <div><label className="label">性別</label>
                <div className="flex gap-2">
                  {["男", "女"].map(g => <button key={g} type="button" className={`tab flex-1 ${form.gender === g ? "active" : ""}`} onClick={() => setForm({ ...form, gender: g })}>{g}</button>)}
                </div>
              </div>
              <div><label className="label">血液型</label>
                <select className="input" value={form.bloodType} onChange={e => setForm({ ...form, bloodType: e.target.value })}>
                  <option value="">未設定</option><option value="A">A</option><option value="B">B</option><option value="O">O</option><option value="AB">AB</option>
                </select>
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
