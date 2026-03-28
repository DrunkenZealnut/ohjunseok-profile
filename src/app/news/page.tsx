"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-sky-50 pb-20">
      <header className="bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 px-5 pt-28 pb-12 text-center">
        <h1 className="text-4xl font-black text-sky-900">활동 소식</h1>
        <p className="mt-3 text-sky-700">
          이문동을 위한 오준석 후보의 활동을 전합니다
        </p>
      </header>

      <div className="mx-auto max-w-2xl px-5">
        {loading ? (
          <p className="text-center text-sm text-sky-400">
            소식을 불러오는 중...
          </p>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-sky-500">아직 등록된 소식이 없습니다.</p>
            <p className="mt-2 text-sm text-sky-400">
              곧 활동 소식을 전해드리겠습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const isExpanded = expandedId === post.id;
              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : post.id)
                    }
                    className="flex w-full items-start gap-4 p-6 text-left transition hover:bg-sky-50/50"
                  >
                    {post.image_url && (
                      <div
                        className="h-20 w-20 shrink-0 rounded-xl bg-sky-100 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${post.image_url})`,
                        }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-sky-800">{post.title}</h2>
                      {!isExpanded && (
                        <p className="mt-1 line-clamp-2 text-sm text-sky-600/70">
                          {post.content}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-sky-400">
                        {new Date(post.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <span className="shrink-0 text-sky-400">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-sky-100 px-6 py-5">
                      <p className="whitespace-pre-wrap leading-relaxed text-sky-700">
                        {post.content}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
