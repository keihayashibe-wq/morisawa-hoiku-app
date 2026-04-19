"use client";

import { useState } from "react";
import Link from "next/link";

interface DashboardData {
  totalChildren: number;
  todayAttendance: number;
  todayAbsence: number;
  todayPresent: number;
  recentAnnouncements: Array<{
    id: string; title: string; category: string; createdAt: string;
    author: { name: string };
  }>;
  activeBroadcasts: Array<{
    id: string; title: string; content: string; severity: string;
  }>;
}

interface Props {
  user: { userId: string; name: string; role: string };
  initialData: DashboardData;
}

export default function DashboardClient({ user, initialData }: Props) {
  const [data] = useState(initialData);

  return (
    <div className="container-app py-6">
      {data.activeBroadcasts?.map((b) => (
        <div key={b.id} className={`mb-4 rounded-2xl p-4 border-l-4 ${b.severity === "CRITICAL" ? "bg-red-50 border-red-500" : b.severity === "WARNING" ? "bg-yellow-50 border-yellow-500" : "bg-blue-50 border-blue-500"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{b.severity === "CRITICAL" ? "🚨" : "⚠️"}</span>
            <span className="font-bold">{b.title}</span>
          </div>
          <p className="text-sm text-gray-700">{b.content}</p>
        </div>
      ))}

      <h1 className="page-header">こんにちは、{user.name}さん</h1>

      {user.role !== "PARENT" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="園児数" value={data.totalChildren} icon="👶" color="bg-blue-50 text-blue-700" />
          <StatCard label="本日の出席" value={data.todayAttendance} icon="✅" color="bg-green-50 text-green-700" />
          <StatCard label="在園中" value={data.todayPresent} icon="🏫" color="bg-purple-50 text-purple-700" />
          <StatCard label="本日の欠席" value={data.todayAbsence} icon="🏠" color="bg-orange-50 text-orange-700" />
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">クイックアクション</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {user.role === "PARENT" ? (
            <>
              <QuickAction href="/attendance" icon="✅" label="登降園" />
              <QuickAction href="/contact-book" icon="📖" label="連絡帳" />
              <QuickAction href="/absence" icon="📝" label="欠席連絡" />
              <QuickAction href="/timeline" icon="📱" label="タイムライン" />
            </>
          ) : (
            <>
              <QuickAction href="/attendance" icon="✅" label="出欠管理" />
              <QuickAction href="/contact-book" icon="📖" label="連絡帳" />
              <QuickAction href="/nap-check" icon="😴" label="午睡チェック" />
              <QuickAction href="/timeline" icon="📱" label="投稿する" />
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-700">最新のお知らせ</h2>
          <Link href="/announcements" className="text-sm text-[var(--color-primary)]">すべて見る</Link>
        </div>
        {data.recentAnnouncements?.length ? (
          <div className="space-y-3">
            {data.recentAnnouncements.map((a) => (
              <Link href="/announcements" key={a.id} className="block p-3 rounded-xl hover:bg-gray-50 transition">
                <div className="flex items-center gap-2">
                  <span className={`badge ${a.category === "IMPORTANT" ? "bg-red-100 text-red-700" : a.category === "EVENT" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                    {a.category === "IMPORTANT" ? "重要" : a.category === "EVENT" ? "行事" : "一般"}
                  </span>
                  <span className="font-medium text-sm">{a.title}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{a.author.name} · {new Date(a.createdAt).toLocaleDateString("ja-JP")}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">お知らせはありません</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className={`card ${color} !border-0`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium opacity-75">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="card flex flex-col items-center gap-2 hover:shadow-md transition-shadow !p-4 text-center">
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  );
}
