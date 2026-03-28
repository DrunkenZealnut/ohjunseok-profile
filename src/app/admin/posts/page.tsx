"use client";

import { useEffect, useState } from "react";
import { adminGet, adminPost, adminPut, adminDelete } from "@/lib/admin-fetch";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

interface PostForm {
  title: string;
  content: string;
  image_url: string;
}

const EMPTY_FORM: PostForm = { title: "", content: "", image_url: "" };

export default function AdminPosts() {
  const [items, setItems] = useState<Post[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  function load() {
    adminGet(`table=posts&page=${page}`).then((res) => {
      setItems(res.data);
      setCount(res.count);
    });
  }

  useEffect(() => { load(); }, [page]);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(post: Post) {
    setForm({ title: post.title, content: post.content, image_url: post.image_url || "" });
    setEditingId(post.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);

    const data = {
      title: form.title.trim(),
      content: form.content.trim(),
      image_url: form.image_url.trim() || null,
    };

    if (editingId) {
      await adminPut({ table: "posts", id: editingId, data });
    } else {
      await adminPost({ table: "posts", data });
    }

    setSaving(false);
    closeForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("이 소식을 삭제하시겠습니까?")) return;
    await adminDelete("posts", id);
    load();
  }

  const totalPages = Math.ceil(count / 20);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          소식 관리 <span className="text-base font-normal text-gray-400">({count}건)</span>
        </h1>
        <button
          onClick={openNew}
          className="flex items-center gap-1 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
        >
          <Plus className="h-4 w-4" />
          새 소식
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border-2 border-sky-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">
              {editingId ? "소식 수정" : "새 소식 작성"}
            </h2>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="제목"
            className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="이미지 URL (선택)"
            className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="본문"
            rows={5}
            className="mb-3 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          />
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.content.trim()}
            className="rounded-lg bg-sky-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.id} className="flex items-start justify-between rounded-xl bg-white p-5 shadow-sm">
            <div>
              <p className="font-bold text-gray-800">{p.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{p.content}</p>
              <p className="mt-2 text-xs text-gray-400">
                {new Date(p.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-gray-400 transition hover:bg-sky-50 hover:text-sky-600">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(p.id)} className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="rounded-lg bg-gray-200 px-4 py-2 text-sm disabled:opacity-30">이전</button>
          <span className="text-sm text-gray-500">{page} / {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="rounded-lg bg-gray-200 px-4 py-2 text-sm disabled:opacity-30">다음</button>
        </div>
      )}
    </div>
  );
}
