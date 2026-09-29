"use client";

import { useState } from "react";
import { writingTasks as bundledWritingTasks } from "@/data/practice";
import type { WritingTask } from "@/data/practice";
import { WritingWorkspace } from "@/components/practice/WritingWorkspace";

export function WritingBrowser({
  tasks = [],
  initialTaskId,
}: {
  tasks?: WritingTask[];
  initialTaskId?: string;
}) {
  const uploadedIds = new Set(tasks.map((task) => task.id));
  const writingTasks = [...bundledWritingTasks.filter((task) => !uploadedIds.has(task.id)), ...tasks];
  const [taskId, setTaskId] = useState(() =>
    writingTasks.some((task) => task.id === initialTaskId) ? initialTaskId! : writingTasks[0]?.id ?? "",
  );
  const active = writingTasks.find((t) => t.id === taskId) ?? writingTasks[0];

  if (!active) return <p className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">No writing tasks are available yet.</p>;

  return (
    <div>
      {/* <div className="mb-6 flex flex-wrap gap-2">
        {writingTasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => setTaskId(task.id)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              taskId === task.id
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
            }`}
          >
            {task.task}: {task.title}
          </button>
        ))}
      </div> */}
      <WritingWorkspace key={active.id} task={active} />
    </div>
  );
}
