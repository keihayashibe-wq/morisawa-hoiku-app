"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; role: string; avatarUrl: string | null };
  images: Array<{ id: string; imageUrl: string }>;
  comments: Array<{ id: string; content: string; createdAt: string; author: { name: string; role: string } }>;
  likes: Array<{ userId: string }>;
  _count: { likes: number; comments: number };
}

export default function TimelinePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadPosts = () => fetch("/api/timeline").then((r) => r.json()).then(setPosts);

  useEffect(() => { if (user) loadPosts(); }, [user]);

  const handlePost = async () => {
    if (!content.trim()) return;
    await fetch("/api/timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, imageUrls: images }),
    });
    setContent("");
    setImages([]);
    loadPosts();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setImages([...images, data.url]);
    setUploading(false);
  };

  const handleLike = async (postId: string) => {
    await fetch("/api/timeline/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    loadPosts();
  };

  const handleComment = async (postId: string, commentContent: string) => {
    await fetch("/api/timeline/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: commentContent }),
    });
    loadPosts();
  };

  if (!user) return null;

  const canPost = user.role !== "PARENT";

  return (
    <div className="container-app py-6 max-w-2xl">
      <h1 className="page-header">📱 タイムライン</h1>

      {canPost && (
        <div className="card mb-4">
          <textarea
            className="input min-h-[80px] mb-3"
            placeholder="園の様子を投稿しましょう..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {images.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {images.map((url, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  >✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()} className="btn btn-secondary text-sm" disabled={uploading}>
              {uploading ? "アップロード中..." : "📷 写真を追加"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <button onClick={handlePost} className="btn btn-primary text-sm ml-auto" disabled={!content.trim()}>投稿する</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} userId={user.userId} onLike={handleLike} onComment={handleComment} />
        ))}
        {posts.length === 0 && <div className="card text-center text-gray-400 py-8">まだ投稿がありません</div>}
      </div>
    </div>
  );
}

function PostCard({ post, userId, onLike, onComment }: {
  post: Post;
  userId: string;
  onLike: (id: string) => void;
  onComment: (id: string, content: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const isLiked = post.likes.some((l) => l.userId === userId);

  const submitComment = () => {
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText("");
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-lg font-bold text-[var(--color-primary)]">
          {post.author.name[0]}
        </div>
        <div>
          <p className="font-semibold text-sm">{post.author.name}</p>
          <p className="text-xs text-gray-400">
            {post.author.role === "TEACHER" ? "保育士" : "管理者"} · {new Date(post.createdAt).toLocaleString("ja-JP")}
          </p>
        </div>
      </div>

      <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>

      {post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {post.images.map((img) => (
            <img key={img.id} src={img.imageUrl} alt="" className="rounded-xl w-full h-48 object-cover" />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <button onClick={() => onLike(post.id)} className={`flex items-center gap-1 text-sm py-2 ${isLiked ? "text-red-500" : "text-gray-400"}`}>
          {isLiked ? "❤️" : "🤍"} {post._count.likes}
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 text-sm text-gray-400 py-2">
          💬 {post._count.comments}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {post.comments.map((c) => (
            <div key={c.id} className="mb-2 text-sm">
              <span className="font-semibold">{c.author.name}</span>
              <span className="text-gray-400 text-xs ml-2">{c.author.role === "PARENT" ? "保護者" : "保育士"}</span>
              <p className="text-gray-700">{c.content}</p>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              className="input text-sm !py-2"
              placeholder="コメントを入力..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
            />
            <button onClick={submitComment} className="btn btn-primary !px-4 !py-2 text-sm">送信</button>
          </div>
        </div>
      )}
    </div>
  );
}
