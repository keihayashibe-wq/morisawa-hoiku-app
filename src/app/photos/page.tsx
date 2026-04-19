"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Album {
  id: string; title: string; description: string | null; date: string;
  createdBy: { name: string }; photos: Array<{ id: string; imageUrl: string; caption: string | null }>;
  _count: { photos: number };
}

export default function PhotosPage() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "" });
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => fetch("/api/photos").then(r => r.json()).then(setAlbums);
  useEffect(() => { if (user) load(); }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      setUploadedUrls(prev => [...prev, data.url]);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/photos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, photoUrls: uploadedUrls }),
    });
    setShowForm(false);
    setUploadedUrls([]);
    load();
  };

  if (!user) return null;
  const canEdit = user.role !== "PARENT";

  return (
    <div className="container-app py-6">
      <h1 className="page-header">📷 写真アルバム</h1>

      {canEdit && <button onClick={() => setShowForm(true)} className="btn btn-primary mb-4 w-full sm:w-auto">アルバムを作成</button>}

      {selectedAlbum ? (
        <div>
          <button onClick={() => setSelectedAlbum(null)} className="btn btn-secondary mb-4">← アルバム一覧に戻る</button>
          <h2 className="text-lg font-bold mb-2">{selectedAlbum.title}</h2>
          <p className="text-sm text-gray-500 mb-4">{selectedAlbum.date} · {selectedAlbum.createdBy.name}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {selectedAlbum.photos.map(p => (
              <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden">
                <img src={p.imageUrl} alt={p.caption || ""} className="w-full h-full object-cover" />
                {p.caption && <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">{p.caption}</div>}
              </div>
            ))}
          </div>
          {selectedAlbum.photos.length === 0 && <div className="card text-center text-gray-400 py-8">写真がまだありません</div>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {albums.map(album => (
            <div key={album.id} className="card cursor-pointer hover:shadow-md transition" onClick={() => setSelectedAlbum(album)}>
              {album.photos[0] ? (
                <img src={album.photos[0].imageUrl} alt="" className="w-full h-40 object-cover rounded-xl mb-3" />
              ) : (
                <div className="w-full h-40 bg-gray-100 rounded-xl mb-3 flex items-center justify-center text-4xl text-gray-300">📷</div>
              )}
              <h3 className="font-semibold">{album.title}</h3>
              <p className="text-xs text-gray-400">{album.date} · {album._count.photos}枚 · {album.createdBy.name}</p>
            </div>
          ))}
          {albums.length === 0 && <div className="card text-center text-gray-400 py-8 col-span-2">アルバムはまだありません</div>}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">アルバムを作成</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">タイトル</label><input className="input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><label className="label">日付</label><input className="input" type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><label className="label">説明</label><textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div>
                <label className="label">写真</label>
                <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-secondary w-full" disabled={uploading}>
                  {uploading ? "アップロード中..." : `📷 写真を追加 (${uploadedUrls.length}枚)`}
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                {uploadedUrls.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {uploadedUrls.map((url, i) => <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-lg" />)}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">作成</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">キャンセル</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
