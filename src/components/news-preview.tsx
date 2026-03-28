"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowRight } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export default function NewsPreview() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setPosts(data);
      });
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <h2 className="mb-10 text-center text-3xl font-black text-sky-800 after:mx-auto after:mt-3 after:block after:h-1 after:w-15 after:rounded-full after:bg-sky-500">
        활동 소식
      </h2>

      <div className="grid gap-5 sm:grid-cols-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div
              className="aspect-[4/3] bg-gradient-to-br from-sky-100 to-sky-200"
              style={
                post.image_url
                  ? {
                      backgroundImage: `url(${post.image_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            />
            <div className="p-5">
              <h3 className="mb-2 line-clamp-2 font-bold text-sky-800">
                {post.title}
              </h3>
              <p className="text-xs text-sky-400">
                {new Date(post.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 transition hover:text-sky-800"
        >
          소식 전체 보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
