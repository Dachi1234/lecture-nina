"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Topic = { id: string; number: number; titleKa: string; titleEs: string; internalRef: string | null; materials: number };
type Block = { id: string; order: number; titleEs: string; titleKa: string; topics: Topic[] };
type Course = { id: string; title: string; level: string; blocks: Block[] };

export function CurriculumBoard({ courses }: { courses: Course[] }) {
  return (
    <div className="flex flex-col gap-6">
      {courses.map((course) => (
        <section key={course.id} className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold">{course.title}</h2>
          {course.blocks.map((block) => (
            <BlockCard key={block.id} block={block} />
          ))}
        </section>
      ))}
    </div>
  );
}

function BlockCard({ block }: { block: Block }) {
  const router = useRouter();
  const [titleKa, setTitleKa] = useState(block.titleKa);
  const [titleEs, setTitleEs] = useState(block.titleEs);

  async function save() {
    await fetch(`/v1/admin/blocks/${block.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titleKa, titleEs }),
    });
    router.refresh();
  }

  async function move(direction: "up" | "down") {
    await fetch(`/v1/admin/blocks/${block.id}/move`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    router.refresh();
  }

  return (
    <article className="rounded-2xl border-[1.5px] border-line bg-card p-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-sm font-semibold">ქართული<input value={titleKa} onChange={(event) => setTitleKa(event.target.value)} className="mt-1 h-11 rounded-xl border-[1.5px] border-sand px-3 font-medium" /></label>
        <label className="text-sm font-semibold">ესპანური<input value={titleEs} onChange={(event) => setTitleEs(event.target.value)} className="mt-1 h-11 rounded-xl border-[1.5px] border-sand px-3 font-medium" /></label>
        <button type="button" className="h-11 rounded-xl bg-teal-deep px-3 text-sm font-semibold text-on-dark" onClick={() => void save()}>შენახვა</button>
        <button type="button" aria-label="ბლოკი ზემოთ" className="h-11 w-11 rounded-xl border border-sand" onClick={() => void move("up")}>↑</button>
        <button type="button" aria-label="ბლოკი ქვემოთ" className="h-11 w-11 rounded-xl border border-sand" onClick={() => void move("down")}>↓</button>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {block.topics.map((topic) => (
          <TopicRow key={topic.id} topic={topic} />
        ))}
      </ul>
    </article>
  );
}

function TopicRow({ topic }: { topic: Topic }) {
  const router = useRouter();
  const [titleKa, setTitleKa] = useState(topic.titleKa);
  const [titleEs, setTitleEs] = useState(topic.titleEs);
  const [internalRef, setInternalRef] = useState(topic.internalRef ?? "");

  async function save() {
    await fetch(`/v1/admin/topics/${topic.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titleKa, titleEs, internalRef }),
    });
    router.refresh();
  }

  async function move(direction: "up" | "down") {
    await fetch(`/v1/admin/topics/${topic.id}/move`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    router.refresh();
  }

  return (
    <li className="grid items-center gap-2 border-t border-line-soft pt-2 lg:grid-cols-[auto_1fr_1fr_1fr_auto]">
      <span className="text-sm font-semibold">{topic.number}</span>
      <input value={titleKa} aria-label="თემის ქართული სათაური" onChange={(event) => setTitleKa(event.target.value)} className="h-10 rounded-lg border-[1.5px] border-sand px-2" />
      <input value={titleEs} aria-label="თემის ესპანური სათაური" onChange={(event) => setTitleEs(event.target.value)} className="h-10 rounded-lg border-[1.5px] border-sand px-2" />
      <input value={internalRef} aria-label="შიდა ნომერი" onChange={(event) => setInternalRef(event.target.value)} className="h-10 rounded-lg border-[1.5px] border-sand px-2" />
      <div className="flex items-center gap-1">
        <span className="text-xs text-ink-muted">{topic.materials}</span>
        <button type="button" className="h-10 rounded-lg px-2 text-sm font-semibold text-teal-deep" onClick={() => void save()}>შენახვა</button>
        <button type="button" aria-label="თემა ზემოთ" className="h-10 w-10 rounded-lg border border-sand" onClick={() => void move("up")}>↑</button>
        <button type="button" aria-label="თემა ქვემოთ" className="h-10 w-10 rounded-lg border border-sand" onClick={() => void move("down")}>↓</button>
      </div>
    </li>
  );
}
