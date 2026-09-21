"use client";

import { useState } from "react";
import { writingTasks } from "@/data/practice";
import { WritingWorkspace } from "@/components/practice/WritingWorkspace";

export function WritingBrowser() {
  const [taskId, setTaskId] = useState(writingTasks[0].id);
  const active = writingTasks.find((t) => t.id === taskId) ?? writingTasks[0];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
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
      </div>
      <WritingWorkspace key={active.id} task={active} />
    </div>
  );
}
