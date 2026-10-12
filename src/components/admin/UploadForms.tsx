"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";

type UploadResult = { ok: boolean; message: string };
type Accent = "blue" | "violet" | "amber";
type PickedFile = { name: string; size: number };

const ACCENTS: Record<Accent, { badge: string; drag: string; button: string; file: string }> = {
  blue: { badge: "bg-blue-50 text-blue-700", drag: "border-blue-400 bg-blue-50", button: "bg-blue-600 hover:bg-blue-700", file: "bg-blue-50 text-blue-700" },
  violet: { badge: "bg-violet-50 text-violet-700", drag: "border-violet-400 bg-violet-50", button: "bg-violet-600 hover:bg-violet-700", file: "bg-violet-50 text-violet-700" },
  amber: { badge: "bg-amber-50 text-amber-700", drag: "border-amber-400 bg-amber-50", button: "bg-amber-600 hover:bg-amber-700", file: "bg-amber-50 text-amber-700" },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFiles(list: FileList | null): PickedFile[] {
  if (!list) return [];
  return Array.from(list).map((file) => ({ name: file.name, size: file.size }));
}

function FileDrop({
  name,
  accept,
  multiple = false,
  required = true,
  accent,
  icon,
  idle,
  selectedLabel,
}: {
  name: string;
  accept: string;
  multiple?: boolean;
  required?: boolean;
  accent: Accent;
  icon: IconName;
  idle: string;
  selectedLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const tone = ACCENTS[accent];

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const input = inputRef.current;
    if (!input) return;
    try {
      input.files = e.dataTransfer.files;
    } catch {
      /* browsers that block assignment still allow click-to-browse */
    }
    setFiles(readFiles(input.files));
  }

  const summary = files.length === 0 ? null : files.length === 1 ? files[0] : null;

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 transition-colors ${
        dragging ? tone.drag : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        required={required}
        className="sr-only"
        onChange={(e) => setFiles(readFiles(e.target.files))}
      />
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${files.length ? tone.file : "bg-white text-zinc-400 ring-1 ring-zinc-200"}`}>
        <Icon name={files.length ? "check" : icon} size={18} />
      </span>
      <span className="min-w-0">
        {files.length === 0 ? (
          <>
            <span className="block truncate text-sm font-semibold text-zinc-700">{idle}</span>
            <span className="block text-xs text-zinc-400">Click to browse â€” or drop a file here</span>
          </>
        ) : summary ? (
          <>
            <span className="block truncate text-sm font-semibold text-zinc-800">{summary.name}</span>
            <span className="block text-xs text-zinc-400">{formatSize(summary.size)} Â· drop to replace</span>
          </>
        ) : (
          <>
            <span className="block truncate text-sm font-semibold text-zinc-800">
              {files.length} {selectedLabel}
            </span>
            <span className="block truncate text-xs text-zinc-400">{files.map((file) => file.name).join(", ")}</span>
          </>
        )}
      </span>
    </label>
  );
}

function ResultAlert({ result }: { result: UploadResult | null }) {
  if (!result) return null;
  return (
    <p
      role="status"
      className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm leading-5 ${
        result.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"
      }`}
    >
      <Icon name={result.ok ? "check" : "x"} size={16} className="mt-0.5 shrink-0" />
      <span>{result.message}</span>
    </p>
  );
}

function FormCard({
  accent,
  icon,
  title,
  description,
  children,
}: {
  accent: Accent;
  icon: IconName;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-zinc-100 px-6 py-5">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${ACCENTS[accent].badge}`}>
          <Icon name={icon} size={20} />
        </span>
        <div>
          <h3 className="font-display text-lg font-bold text-zinc-900">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-zinc-500">{description}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-6 py-5">{children}</div>
    </div>
  );
}

function SubmitButton({ busy, busyLabel, label, accent }: { busy: boolean; busyLabel: string; label: string; accent: Accent }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-50 ${ACCENTS[accent].button}`}
    >
      {busy ? busyLabel : label}
    </button>
  );
}

export function UploadForms() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [practiceBusy, setPracticeBusy] = useState(false);
  const [practiceResult, setPracticeResult] = useState<UploadResult | null>(null);
  const [writingSpeakingBusy, setWritingSpeakingBusy] = useState(false);
  const [writingSpeakingResult, setWritingSpeakingResult] = useState<UploadResult | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const text = await res.text();
      let data: {
        ok?: boolean;
        warnings?: string[];
        errors?: { message: string }[];
        dispatched?: boolean;
        status?: number;
        error?: string;
      } | null = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
      if (res.ok) {
        const warnings = data?.warnings?.length ? ` ${data.warnings.join(" ")}` : "";
        const note = data?.dispatched
          ? "Audio generation started."
          : `Audio was NOT scheduled â€” ${data?.status ?? ""} ${data?.error ?? "check GITHUB_TOKEN / GITHUB_REPO"}`.trim();
        setResult({ ok: true, message: `Uploaded. ${note}${warnings}` });
        router.refresh();
      } else {
        const errors = data?.errors?.map((x) => x.message).join("; ");
        setResult({ ok: false, message: errors || text.trim() || `Upload failed (${res.status})` });
      }
    } catch {
      setResult({ ok: false, message: "Upload failed (network error)" });
    } finally {
      setBusy(false);
    }
  }

  async function uploadPracticeSets(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    setPracticeBusy(true);
    setPracticeResult(null);
    try {
      const res = await fetch("/api/admin/practice-sets", {
        method: "POST",
        body: new FormData(formElement),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        listening?: number;
        reading?: number;
        replacedIds?: string[];
        audio?: { id: string; ok: boolean; status?: number; error?: string }[];
        errors?: string[];
        error?: string;
      } | null;
      if (!res.ok) {
        setPracticeResult({
          ok: false,
          message: data?.errors?.join("; ") || data?.error || `Upload failed (${res.status})`,
        });
        return;
      }
      const replaced = data?.replacedIds?.length ? ` Replaced matching IDs: ${data.replacedIds.join(", ")}.` : "";
      const failedAudio = data?.audio?.filter((item) => !item.ok) ?? [];
      const pendingAudio = data?.audio?.filter((item) => item.ok) ?? [];
      const audioMessage = (data?.audio?.length ?? 0) === 0
        ? ""
        : `${pendingAudio.length ? ` Audio generation queued for ${pendingAudio.map((item) => item.id).join(", ")}.` : ""}${failedAudio.length ? ` Audio could not be queued for ${failedAudio.map((item) => `${item.id} (${item.status ?? ""} ${item.error ?? ""})`).join(", ")}.` : ""}`;
      setPracticeResult({
        ok: true,
        message: `Uploaded ${data?.listening ?? 0} listening and ${data?.reading ?? 0} reading set(s).${replaced}${audioMessage}`,
      });
      formElement.reset();
      router.refresh();
    } catch {
      setPracticeResult({ ok: false, message: "Upload failed (network error)." });
    } finally {
      setPracticeBusy(false);
    }
  }

  async function uploadWritingSpeaking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    setWritingSpeakingBusy(true);
    setWritingSpeakingResult(null);
    try {
      const res = await fetch("/api/admin/practice-sets", { method: "POST", body: new FormData(formElement) });
      const data = (await res.json().catch(() => null)) as {
        writing?: number; speaking?: number; replacedIds?: string[]; errors?: string[]; error?: string;
      } | null;
      if (!res.ok) {
        setWritingSpeakingResult({ ok: false, message: data?.errors?.join("; ") || data?.error || `Upload failed (${res.status})` });
        return;
      }
      const replaced = data?.replacedIds?.length ? ` Replaced matching IDs: ${data.replacedIds.join(", ")}.` : "";
      setWritingSpeakingResult({ ok: true, message: `Uploaded ${data?.writing ?? 0} writing and ${data?.speaking ?? 0} speaking task(s).${replaced}` });
      formElement.reset();
      router.refresh();
    } catch {
      setWritingSpeakingResult({ ok: false, message: "Upload failed (network error)." });
    } finally {
      setWritingSpeakingBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <form onSubmit={onSubmit} className="contents">
          <FormCard accent="blue" icon="clipboard-list" title="Mock exam" description="Upload one JSON file shaped like the mock template.">
            <FileDrop name="file" accept="application/json,.json" accent="blue" icon="clipboard-list" idle="Mock exam JSON" selectedLabel="file selected" />
            <SubmitButton busy={busy} busyLabel="Uploadingâ€¦" label="Upload mock exam" accent="blue" />
            <ResultAlert result={result} />
          </FormCard>
        </form>

        <form onSubmit={uploadPracticeSets} className="contents">
          <FormCard accent="violet" icon="layers" title="Listening & reading practice" description="Upload listening and reading JSON with any referenced track images.">
            <FileDrop name="file" accept="application/json,.json" accent="violet" icon="clipboard-list" idle="Practice-set JSON" selectedLabel="file selected" />
            <FileDrop name="images" accept="image/png,image/jpeg,image/webp" multiple required={false} accent="violet" icon="camera" idle="Track images (optional)" selectedLabel="images selected" />
            <SubmitButton busy={practiceBusy} busyLabel="Uploadingâ€¦" label="Upload practice sets" accent="violet" />
            <ResultAlert result={practiceResult} />
          </FormCard>
        </form>

        <form onSubmit={uploadWritingSpeaking} className="contents">
          <FormCard accent="amber" icon="pen" title="Writing &amp; speaking tasks" description="Upload WritingTask and SpeakingTask objects in a JSON file. Matching IDs are replaced.">
            <FileDrop name="file" accept="application/json,.json" accent="amber" icon="pen" idle="Writing & speaking JSON" selectedLabel="file selected" />
            <SubmitButton busy={writingSpeakingBusy} busyLabel="Uploadingâ€¦" label="Upload writing & speaking" accent="amber" />
            <ResultAlert result={writingSpeakingResult} />
          </FormCard>
        </form>
      </div>

      <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-4 text-xs leading-5 text-zinc-500">
        <strong className="text-zinc-700">Good to know:</strong> IDs are replacement keys â€” uploading a file with an
        existing ID replaces that content. Uploads go live immediately; listening audio is queued automatically
        (about 2 minutes) and can be watched under{" "}
        <a href="/admin/audio" className="font-semibold text-blue-700 underline underline-offset-2">
          Audio jobs
        </a>
        .
      </p>
    </div>
  );
}
