"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ProgramStudy = {
  id: number;
  name: string;
  degree: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_ABSTRACT_WORDS = 350;
const MAX_KEYWORDS = 10;
const ALLOWED_FILE_TYPES =[ "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
const ALLOWED_FILE_LABEL = "PDF, DOC, atau DOCX";
const CURRENT_YEAR = new Date().getFullYear();

type SubmitState = | { status: "idle" }  | { status: "submitting" } | { status: "success" }  | { status: "error"; message: string };

function countWords(text: string) {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

//tampilkan ukuran file 
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ArtikelJurnalForm() {
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [tahun, setTahun] = useState(String(CURRENT_YEAR));
  const [judul, setJudul] = useState("");
  const [abstract, setAbstract] = useState("");

  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordError, setKeywordError] = useState<string | null>(null);

  const [programStudyId, setProgramStudyId] = useState("");
  const [programStudies, setProgramStudies] = useState<ProgramStudy[]>([]);

    useEffect(() => {
        async function fetchProgramStudies() {
            try {
                const res = await fetch("/api/program-studies");
                const data = await res.json();
                if (res.ok) {
                    setProgramStudies(data);
                }
            } catch (error) {
                console.error("Gagal mengambil program studi", error);
            }
        }

        fetchProgramStudies();
    }, []);

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });

  const abstractWordCount = useMemo(() => countWords(abstract), [abstract]);
  const abstractOverLimit = abstractWordCount > MAX_ABSTRACT_WORDS;

  function addKeyword() {
    const parts = keywordInput
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

    setKeywordInput("");

    if (parts.length === 0) return;

    setKeywords((prev) => {
        const gabungan = [...prev];

        for (const kata of parts) {
            if (gabungan.length >= MAX_KEYWORDS) {
                setKeywordError(`Maksimal ${MAX_KEYWORDS} kata kunci`);
                break;
            }
            const sudahAda = gabungan.some((k) => k.toLowerCase() === kata.toLowerCase());
            if (sudahAda) {
                continue;
            }
            gabungan.push(kata);
            setKeywordError(null);
        }

        return gabungan;
    });
}

  function removeKeyword(target: string) {
    setKeywords((prev) => prev.filter((k) => k !== target));
    setKeywordError(null);
  }

  function validateAndSetFile(candidate: File | null) {
    if (!candidate) {
      setFile(null);
      setFileError(null);
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setFileError("Maksimal ukuran file adalah 100 MB");
      setFile(null);
      return;
    }
    if (!ALLOWED_FILE_TYPES.includes(candidate.type)) {
      setFileError(`File hanya boleh ${ALLOWED_FILE_LABEL}`);
      setFile(null);
      return;
    }
    setFileError(null);
    setFile(candidate);
  }

  function resetForm() {
    setName("");
    setNim("");
    setTahun(String(CURRENT_YEAR));
    setJudul("");
    setAbstract("");
    setKeywords([]);
    setKeywordInput("");
    setKeywordError(null);
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const canSubmit =
    name.trim() &&
    nim.trim() &&
    judul.trim() &&
    abstract.trim() &&
    !abstractOverLimit &&
    tahun.trim() &&
    programStudyId &&
    !fileError &&
    submit.status !== "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmit({ status: "submitting" });

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("nim", nim.trim());
    formData.append("tahun", tahun.trim());
    formData.append("judul", judul.trim());
    formData.append("programStudyId", programStudyId)
    formData.append("abstract", abstract.trim());
    keywords.forEach((k) => formData.append("keywords", k));
    if (file) formData.append("file", file);

    try {
      const res = await fetch("/api/artikel-jurnal", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.message ?? body?.error ?? "Gagal mengirim artikel jurnal";
        setSubmit({ status: "error", message });
        return;
      }

      setSubmit({ status: "success" });
      resetForm();
    } catch {
      setSubmit({
        status: "error",
        message: "Tidak dapat terhubung ke server, coba lagi",
      });
    }
  }
   return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Artikel Jurnal Baru</h1>
                    <p className="mt-2 text-gray-600">
                        Lengkapi data di bawah untuk mengunggah artikel jurnal ke arsip.
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* PENULIS */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                                    Nama Lengkap
                                </label>
                                <input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Siti Aminah"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="nim" className="mb-2 block text-sm font-medium text-gray-700">
                                    NIM
                                </label>
                                <input
                                    id="nim"
                                    value={nim}
                                    onChange={(e) => setNim(e.target.value)}
                                    placeholder="Contoh: 20210001"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    required
                                />
                            </div>
                        </div>

                        {/* JUDUL + TAHUN */}
                        <div>
                            <label htmlFor="judul" className="mb-2 block text-sm font-medium text-gray-700">
                                Judul Artikel
                            </label>
                            <input
                                id="judul"
                                value={judul}
                                onChange={(e) => setJudul(e.target.value)}
                                placeholder="Judul lengkap artikel"
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="tahun" className="mb-2 block text-sm font-medium text-gray-700">
                                Tahun
                            </label>
                            <input
                                id="tahun"
                                type="number"
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                min={2000}
                                max={CURRENT_YEAR}
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                required
                            />
                        </div>

                        <div>
                          <label htmlFor="programStudy" className="mb-2 block text-sm font-medium text-gray-700">Program Studi</label>
                          <select
                              id="programStudy"
                              value={programStudyId}
                              onChange={(e) => setProgramStudyId(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                              required
                          >
                              <option value="">-- Pilih Program Studi --</option>
                              {programStudies.map((ps) => (
                                  <option key={ps.id} value={ps.id}>
                                      {ps.degree} {ps.name}
                                  </option>
                              ))}
                          </select>
                        </div>

                        {/* ABSTRAK */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label htmlFor="abstract" className="block text-sm font-medium text-gray-700">
                                    Abstrak
                                </label>
                                <span className={`text-xs font-medium ${abstractOverLimit ? "text-red-500" : "text-slate-400"}`}>
                                    {abstractWordCount} / {MAX_ABSTRACT_WORDS} kata
                                </span>
                            </div>
                            <textarea
                                id="abstract"
                                value={abstract}
                                onChange={(e) => setAbstract(e.target.value)}
                                rows={6}
                                placeholder="Ringkasan isi artikel..."
                                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                                    abstractOverLimit
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                                }`}
                                required
                            />
                            {abstractOverLimit && (
                                <p className="mt-1.5 text-xs text-red-500">
                                    Abstrak melebihi batas {MAX_ABSTRACT_WORDS} kata
                                </p>
                            )}
                        </div>

                        {/* KATA KUNCI */}
                        <div>
                            <label htmlFor="keywordInput" className="mb-2 block text-sm font-medium text-gray-700">
                                Kata Kunci <span className="font-normal text-slate-400">(maksimal {MAX_KEYWORDS})</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="keywordInput"
                                    value={keywordInput}
                                    onChange={(e) => {
                                        setKeywordInput(e.target.value);
                                        if (keywordError) setKeywordError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addKeyword();
                                        }
                                    }}
                                    placeholder="Contoh: Machine Learning"
                                    disabled={keywords.length >= MAX_KEYWORDS}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={addKeyword}
                                    disabled={keywords.length >= MAX_KEYWORDS || !keywordInput.trim()}
                                    className="shrink-0 rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    + Tambah
                                </button>
                            </div>

                            {keywordError && (
                                <p className="mt-1.5 text-xs text-red-500">{keywordError}</p>
                            )}

                            {keywords.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {keywords.map((k) => (
                                        <span
                                            key={k}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                                        >
                                            {k}
                                            <button
                                                type="button"
                                                onClick={() => removeKeyword(k)}
                                                aria-label={`Hapus kata kunci ${k}`}
                                                className="text-blue-400 hover:text-blue-700"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* BERKAS */}
                        <div>
                            <label htmlFor="file" className="mb-2 block text-sm font-medium text-gray-700">
                                Berkas <span className="font-normal text-slate-400">(opsional, {ALLOWED_FILE_LABEL}, maksimal 100 MB)</span>
                            </label>

                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    validateAndSetFile(e.dataTransfer.files?.[0] ?? null);
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-8 text-center transition ${
                                    isDragging
                                        ? "border-blue-400 bg-blue-50"
                                        : fileError
                                          ? "border-red-300 bg-red-50"
                                          : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    id="file"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? null)}
                                    className="hidden"
                                />
                                {file ? (
                                    <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                                        <span className="font-semibold text-slate-800">{file.name}</span>
                                        <span className="text-slate-400">{formatBytes(file.size)}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                validateAndSetFile(null);
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                            }}
                                            className="font-semibold text-red-500 hover:text-red-700"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        Klik atau seret berkas ke sini
                                    </p>
                                )}
                            </div>
                            {fileError && (
                                <p className="mt-1.5 text-xs text-red-500">{fileError}</p>
                            )}
                        </div>

                        {submit.status === "error" && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600">{submit.message}</p>
                            </div>
                        )}
                        {submit.status === "success" && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                                <p className="text-sm text-emerald-700">Artikel jurnal berhasil dikirim.</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submit.status === "submitting" ? "Mengirim..." : "Kirim Artikel"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </main>
    );
}