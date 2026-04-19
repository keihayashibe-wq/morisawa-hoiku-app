"use client";

import { useState } from "react";

interface Child { id: string; name: string; class: { name: string } | null; }
interface AttendanceRecord {
  id: string; childId: string; date: string; checkInTime: string | null; checkOutTime: string | null;
  checkInBy: string | null; checkOutBy: string | null; pickupPerson: string | null; child: Child;
}

interface Props {
  user: { userId: string; name: string; role: string };
  initialChildren: Child[];
  initialRecords: AttendanceRecord[];
  initialDate: string;
}

export default function AttendanceClient({ user, initialChildren, initialRecords, initialDate }: Props) {
  const [children] = useState(initialChildren);
  const [records, setRecords] = useState(initialRecords);
  const [date, setDate] = useState(initialDate);

  const loadRecords = (d: string) => fetch(`/api/attendance?date=${d}`).then(r => r.json()).then(setRecords);

  const handleDateChange = (d: string) => { setDate(d); loadRecords(d); };

  const handleAction = async (childId: string, action: "checkin" | "checkout", pickupPerson?: string) => {
    await fetch("/api/attendance", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, date, action, pickupPerson }),
    });
    loadRecords(date);
  };

  return (
    <div className="container-app py-6">
      <h1 className="page-header">✅ {user.role === "PARENT" ? "登降園" : "出欠管理"}</h1>
      <div className="flex items-center gap-3 mb-4">
        <input type="date" className="input w-44" value={date} onChange={e => handleDateChange(e.target.value)} />
        <span className="text-sm text-gray-500">出席: {records.filter(r => r.checkInTime).length} / {children.length}名</span>
      </div>
      <div className="space-y-3">
        {children.map(child => {
          const record = records.find(r => r.childId === child.id);
          return <ChildAttendanceCard key={child.id} child={child} record={record} onAction={handleAction} />;
        })}
      </div>
    </div>
  );
}

function ChildAttendanceCard({ child, record, onAction }: { child: Child; record?: AttendanceRecord; onAction: (childId: string, action: "checkin" | "checkout", pickupPerson?: string) => void; }) {
  const [showPickup, setShowPickup] = useState(false);
  const [pickupPerson, setPickupPerson] = useState("");
  const isCheckedIn = !!record?.checkInTime;
  const isCheckedOut = !!record?.checkOutTime;

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div><p className="font-semibold">{child.name}</p><p className="text-xs text-gray-400">{child.class?.name || "未配属"}</p></div>
        <div className="flex items-center gap-2">
          {isCheckedIn && <span className="badge bg-green-100 text-green-700">登園 {record?.checkInTime}</span>}
          {isCheckedOut && <span className="badge bg-blue-100 text-blue-700">降園 {record?.checkOutTime}</span>}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        {!isCheckedIn ? (
          <button onClick={() => onAction(child.id, "checkin")} className="btn btn-primary flex-1 text-sm">🏫 登園する</button>
        ) : !isCheckedOut ? (
          !showPickup ? (
            <button onClick={() => setShowPickup(true)} className="btn btn-secondary flex-1 text-sm">🏠 降園する</button>
          ) : (
            <div className="flex gap-2 flex-1">
              <input className="input text-sm flex-1" placeholder="お迎え者名" value={pickupPerson} onChange={e => setPickupPerson(e.target.value)} />
              <button onClick={() => { onAction(child.id, "checkout", pickupPerson); setShowPickup(false); }} className="btn btn-primary text-sm">確定</button>
            </div>
          )
        ) : (
          <span className="text-sm text-gray-400 py-2">{record?.pickupPerson ? `お迎え: ${record.pickupPerson}` : "降園済み"}</span>
        )}
      </div>
    </div>
  );
}
