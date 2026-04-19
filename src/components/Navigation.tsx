"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

const menuItems = {
  ADMIN: [
    { href: "/dashboard", label: "ホーム", icon: "🏠" },
    { href: "/timeline", label: "タイムライン", icon: "📱" },
    { href: "/contact-book", label: "連絡帳", icon: "📖" },
    { href: "/attendance", label: "出欠管理", icon: "✅" },
    { href: "/absence", label: "欠席連絡", icon: "📝" },
    { href: "/announcements", label: "お知らせ", icon: "📢" },
    { href: "/calendar", label: "カレンダー", icon: "📅" },
    { href: "/photos", label: "写真", icon: "📷" },
    { href: "/children", label: "園児管理", icon: "👶" },
    { href: "/health", label: "健康記録", icon: "🌡️" },
    { href: "/nap-check", label: "午睡チェック", icon: "😴" },
    { href: "/emergency", label: "緊急連絡先", icon: "🆘" },
    { href: "/shifts", label: "シフト管理", icon: "📋" },
    { href: "/broadcast", label: "緊急一斉連絡", icon: "🚨" },
    { href: "/users", label: "ユーザー管理", icon: "👤" },
  ],
  TEACHER: [
    { href: "/dashboard", label: "ホーム", icon: "🏠" },
    { href: "/timeline", label: "タイムライン", icon: "📱" },
    { href: "/contact-book", label: "連絡帳", icon: "📖" },
    { href: "/attendance", label: "出欠管理", icon: "✅" },
    { href: "/absence", label: "欠席連絡", icon: "📝" },
    { href: "/announcements", label: "お知らせ", icon: "📢" },
    { href: "/calendar", label: "カレンダー", icon: "📅" },
    { href: "/photos", label: "写真", icon: "📷" },
    { href: "/children", label: "園児情報", icon: "👶" },
    { href: "/health", label: "健康記録", icon: "🌡️" },
    { href: "/nap-check", label: "午睡チェック", icon: "😴" },
    { href: "/emergency", label: "緊急連絡先", icon: "🆘" },
    { href: "/shifts", label: "シフト確認", icon: "📋" },
    { href: "/broadcast", label: "緊急一斉連絡", icon: "🚨" },
  ],
  PARENT: [
    { href: "/dashboard", label: "ホーム", icon: "🏠" },
    { href: "/timeline", label: "タイムライン", icon: "📱" },
    { href: "/contact-book", label: "連絡帳", icon: "📖" },
    { href: "/attendance", label: "登降園", icon: "✅" },
    { href: "/absence", label: "欠席連絡", icon: "📝" },
    { href: "/announcements", label: "お知らせ", icon: "📢" },
    { href: "/calendar", label: "カレンダー", icon: "📅" },
    { href: "/photos", label: "写真", icon: "📷" },
    { href: "/children", label: "お子さま情報", icon: "👶" },
    { href: "/emergency", label: "緊急連絡先", icon: "🆘" },
  ],
};

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const items = menuItems[user.role as keyof typeof menuItems] || [];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-[var(--color-primary)]">🌳 もりさわ保育園</h1>
          <p className="text-xs text-gray-500 mt-1">{user.name}</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold border-r-3 border-[var(--color-primary)]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={logout} className="btn btn-secondary w-full text-sm">
            ログアウト
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="flex overflow-x-auto gap-0 px-1 py-1">
          {items.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item flex-1 min-w-0 ${pathname === item.href ? "active" : ""}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] truncate w-full text-center">{item.label}</span>
            </Link>
          ))}
          <MobileMoreMenu items={items.slice(5)} pathname={pathname} onLogout={logout} userName={user.name} />
        </div>
      </nav>
    </>
  );
}

function MobileMoreMenu({
  items,
  pathname,
  onLogout,
  userName,
}: {
  items: typeof menuItems.ADMIN;
  pathname: string;
  onLogout: () => void;
  userName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(!open)} className={`nav-item flex-1 min-w-0 ${open ? "active" : ""}`}>
        <span className="text-xl">≡</span>
        <span className="text-[10px]">その他</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[70vh] overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 pb-3 border-b">
              <span className="font-semibold text-gray-700">{userName}</span>
              <button onClick={() => setOpen(false)} className="text-gray-400 text-xl p-2">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl text-center ${
                    pathname === item.href
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </Link>
              ))}
            </div>
            <button onClick={onLogout} className="btn btn-secondary w-full">ログアウト</button>
          </div>
        </div>
      )}
    </>
  );
}

import { useState } from "react";
