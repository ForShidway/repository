"use client";

import { useEffect, useMemo, useState } from "react";

type SDGs = {
    id: number;
    code: string;
    title: string;
};

type Dosen = {
    id: number;
    name: string;
};

type Ruangan = {
    id: number;
    name: string;
};

type ProgramStudy = {
    id: number;
    name: string;
    degree: string;
};

type TugasAkhir = {
    id: number;
    name: string;
    tahunMasuk: number;
    nim: string;
    judul: string;
    mataKuliahRelevan: string;

    ruangan: Ruangan | null;
    pembimbing: Dosen | null;
    dosenPa: Dosen | null;
    programStudy: ProgramStudy | null;

    sdgs: SDGs[];

    fileName: string | null;
    filePath: string | null;
    fileSize: number | null;
    fileType: string | null;

    createdAt: string;
};

export default function RepositoryPage() {

    const [tugasAkhir, setTugasAkhir] = useState<TugasAkhir[]>([]);

    const [q, setQ] = useState("");
    const [prodi, setProdi] = useState("");
    const [tahun, setTahun] = useState("");
    const [dosen, setDosen] = useState("");
    const [sdgFilter, setSdgFilter] = useState<number[]>([]);

    const [sort, setSort] = useState("terbaru");
    const [view, setView] = useState<"grid" | "list">("grid");

    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const PER_PAGE = 6;


    // =========================================================
    // AMBIL DATA TA DARI API
    // =========================================================

    useEffect(() => {

        async function fetchTugasAkhir() {

            try {

                setLoading(true);
                setError("");

                const response = await fetch("/api/tugas-akhirs");

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Gagal mengambil data repository"
                    );
                }

                setTugasAkhir(data);

            } catch (error) {

                console.error(error);

                setError(
                    error instanceof Error
                        ? error.message
                        : "Terjadi kesalahan"
                );

            } finally {

                setLoading(false);

            }

        }

        fetchTugasAkhir();

    }, []);


    // =========================================================
    // DATA UNTUK FILTER
    // =========================================================

    const tahunOptions = useMemo(() => {

        return Array.from(
            new Set(
                tugasAkhir.map(
                    (ta) => ta.tahunMasuk
                )
            )
        ).sort((a, b) => b - a);

    }, [tugasAkhir]);


    const programStudies = useMemo(() => {

        return Array.from(
            new Map(
                tugasAkhir
                    .filter((ta) => ta.programStudy)
                    .map((ta) => [
                        ta.programStudy!.id,
                        ta.programStudy!
                    ])
            ).values()
        );

    }, [tugasAkhir]);


    const dosenList = useMemo(() => {

        return Array.from(
            new Map(
                tugasAkhir
                    .filter((ta) => ta.pembimbing)
                    .map((ta) => [
                        ta.pembimbing!.id,
                        ta.pembimbing!
                    ])
            ).values()
        );

    }, [tugasAkhir]);


    const sdgsList = useMemo(() => {

        return Array.from(
            new Map(
                tugasAkhir
                    .flatMap((ta) => ta.sdgs)
                    .map((sdg) => [
                        sdg.id,
                        sdg
                    ])
            ).values()
        );

    }, [tugasAkhir]);


    // =========================================================
    // FILTER
    // =========================================================

    const filtered = useMemo(() => {

        let result = [...tugasAkhir];

        // SEARCH
        if (q.trim()) {

            const keyword = q.toLowerCase();

            result = result.filter((ta) =>

                ta.judul
                    .toLowerCase()
                    .includes(keyword)

                ||

                ta.name
                    .toLowerCase()
                    .includes(keyword)

                ||

                ta.nim
                    .toLowerCase()
                    .includes(keyword)

                ||

                ta.mataKuliahRelevan
                    .toLowerCase()
                    .includes(keyword)

                ||

                ta.pembimbing?.name
                    ?.toLowerCase()
                    .includes(keyword)

            );

        }


        // PROGRAM STUDI
        if (prodi) {

            result = result.filter(
                (ta) =>
                    ta.programStudy?.id ===
                    Number(prodi)
            );

        }


        // TAHUN
        if (tahun) {

            result = result.filter(
                (ta) =>
                    ta.tahunMasuk ===
                    Number(tahun)
            );

        }


        // DOSEN
        if (dosen) {

            result = result.filter(
                (ta) =>
                    ta.pembimbing?.id ===
                    Number(dosen)
            );

        }


        // SDGs
        if (sdgFilter.length > 0) {

            result = result.filter((ta) =>

                sdgFilter.every(
                    (id) =>
                        ta.sdgs.some(
                            (sdg) =>
                                sdg.id === id
                        )
                )

            );

        }


        // SORTING
        if (sort === "terbaru") {

            result.sort(
                (a, b) =>
                    b.tahunMasuk -
                    a.tahunMasuk
            );

        }

        if (sort === "terlama") {

            result.sort(
                (a, b) =>
                    a.tahunMasuk -
                    b.tahunMasuk
            );

        }

        if (sort === "az") {

            result.sort(
                (a, b) =>
                    a.judul.localeCompare(
                        b.judul
                    )
            );

        }

        return result;

    }, [
        tugasAkhir,
        q,
        prodi,
        tahun,
        dosen,
        sdgFilter,
        sort
    ]);


    // =========================================================
    // PAGINATION
    // =========================================================

    const totalPages = Math.ceil(
        filtered.length / PER_PAGE
    );

    const paged = filtered.slice(
        (page - 1) * PER_PAGE,
        page * PER_PAGE
    );


    // =========================================================
    // SDGs FILTER
    // =========================================================

    function toggleSdg(id: number) {

        setSdgFilter((current) => {

            if (current.includes(id)) {

                return current.filter(
                    (item) => item !== id
                );

            }

            return [
                ...current,
                id
            ];

        });

        setPage(1);

    }


    // =========================================================
    // RESET FILTER
    // =========================================================

    function resetFilters() {

        setQ("");
        setProdi("");
        setTahun("");
        setDosen("");
        setSdgFilter([]);

        setPage(1);

    }


    const hasFilters =
        q ||
        prodi ||
        tahun ||
        dosen ||
        sdgFilter.length > 0;


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <main className="min-h-screen bg-[#FAF8F4]">

                <div className="mx-auto max-w-7xl px-6 py-16">

                    <div className="animate-pulse">

                        <div className="h-8 w-72 rounded bg-slate-200" />

                        <div className="mt-3 h-4 w-96 rounded bg-slate-200" />

                        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">

                            {[1, 2, 3, 4].map(
                                (item) => (

                                    <div
                                        key={item}
                                        className="h-52 rounded-2xl bg-white shadow-sm"
                                    />

                                )
                            )}

                        </div>

                    </div>

                </div>

            </main>

        );

    }


    // =========================================================
    // HALAMAN UTAMA
    // =========================================================

    return (

        <main className="min-h-screen bg-[#FAF8F4]">

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

                {/* HEADER */}

                <div className="mb-8">

                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#1E4FBA]">
                        Repository Otomotif
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight text-[#16367F]">
                        Jelajahi Repositori TA
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9AA0A6]">
                        Temukan dan jelajahi Tugas Akhir mahasiswa
                        Teknik Otomotif berdasarkan program studi,
                        tahun, dosen pembimbing, dan SDGs.
                    </p>

                </div>


                {/* SEARCH */}

                <div className="sticky top-0 z-30 mb-6 rounded-2xl border border-[#E8E4DC] bg-[#FAF8F4]/95 p-3 backdrop-blur">

                    <div className="flex flex-col gap-2 md:flex-row">

                        <div className="relative flex-1">

                            <svg
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA0A6]"
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle
                                    cx="11"
                                    cy="11"
                                    r="8"
                                />

                                <path d="m21 21-4.35-4.35" />

                            </svg>

                            <input
                                type="text"
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Cari judul, mahasiswa, NIM, mata kuliah..."
                                className="w-full rounded-xl border border-[#E8E4DC] bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#1E4FBA] focus:ring-2 focus:ring-[#1E4FBA]/10"
                            />

                        </div>


                        {/* SORT */}

                        <select
                            value={sort}
                            onChange={(e) => {
                                setSort(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-xl border border-[#E8E4DC] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                        >

                            <option value="terbaru">
                                Terbaru
                            </option>

                            <option value="terlama">
                                Terlama
                            </option>

                            <option value="az">
                                A–Z
                            </option>

                        </select>


                        {/* VIEW */}

                        <div className="flex overflow-hidden rounded-xl border border-[#E8E4DC] bg-white">

                            <button
                                type="button"
                                onClick={() =>
                                    setView("grid")
                                }
                                className={`px-4 transition ${
                                    view === "grid"
                                        ? "bg-[#1E4FBA] text-white"
                                        : "text-[#9AA0A6]"
                                }`}
                            >
                                ▦
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setView("list")
                                }
                                className={`px-4 transition ${
                                    view === "list"
                                        ? "bg-[#1E4FBA] text-white"
                                        : "text-[#9AA0A6]"
                                }`}
                            >
                                ☰
                            </button>

                        </div>

                    </div>

                </div>


                <div className="flex gap-7">


                    {/* =====================================================
                        SIDEBAR FILTER
                    ===================================================== */}

                    <aside className="hidden w-60 shrink-0 lg:block">

                        <div className="sticky top-28 rounded-2xl bg-white p-5 shadow-[0_2px_16px_rgba(30,79,186,0.05)]">

                            <div className="mb-5 flex items-center justify-between">

                                <span className="text-sm font-bold text-[#16367F]">
                                    Filter
                                </span>

                                {hasFilters && (

                                    <button
                                        onClick={resetFilters}
                                        className="text-xs font-semibold text-[#E8630A]"
                                    >
                                        Reset
                                    </button>

                                )}

                            </div>


                            {/* PROGRAM STUDI */}

                            <div className="mb-6">

                                <p className="mb-3 text-[10px] font-bold tracking-[0.15em] text-[#9AA0A6]">
                                    PROGRAM STUDI
                                </p>

                                <label className="mb-2 flex cursor-pointer items-center gap-2">

                                    <input
                                        type="radio"
                                        name="prodi"
                                        checked={prodi === ""}
                                        onChange={() => {
                                            setProdi("");
                                            setPage(1);
                                        }}
                                        className="accent-[#1E4FBA]"
                                    />

                                    <span className="text-sm text-slate-600">
                                        Semua
                                    </span>

                                </label>


                                {programStudies.map(
                                    (program) => (

                                        <label
                                            key={program.id}
                                            className="mb-2 flex cursor-pointer items-center gap-2"
                                        >

                                            <input
                                                type="radio"
                                                name="prodi"
                                                checked={
                                                    prodi ===
                                                    String(program.id)
                                                }
                                                onChange={() => {
                                                    setProdi(
                                                        String(program.id)
                                                    );
                                                    setPage(1);
                                                }}
                                                className="accent-[#1E4FBA]"
                                            />

                                            <span className="text-sm text-slate-600">

                                                {program.degree}

                                            </span>

                                        </label>

                                    )
                                )}

                            </div>


                            {/* TAHUN */}

                            <div className="mb-6">

                                <p className="mb-2 text-[10px] font-bold tracking-[0.15em] text-[#9AA0A6]">
                                    TAHUN
                                </p>

                                <select
                                    value={tahun}
                                    onChange={(e) => {
                                        setTahun(
                                            e.target.value
                                        );
                                        setPage(1);
                                    }}
                                    className="w-full rounded-lg border border-[#E8E4DC] bg-white px-3 py-2 text-sm outline-none"
                                >

                                    <option value="">
                                        Semua tahun
                                    </option>

                                    {tahunOptions.map(
                                        (year) => (

                                            <option
                                                key={year}
                                                value={year}
                                            >
                                                {year}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* DOSEN */}

                            <div className="mb-6">

                                <p className="mb-2 text-[10px] font-bold tracking-[0.15em] text-[#9AA0A6]">
                                    DOSEN PEMBIMBING
                                </p>

                                <select
                                    value={dosen}
                                    onChange={(e) => {
                                        setDosen(
                                            e.target.value
                                        );
                                        setPage(1);
                                    }}
                                    className="w-full rounded-lg border border-[#E8E4DC] bg-white px-3 py-2 text-sm outline-none"
                                >

                                    <option value="">
                                        Semua dosen
                                    </option>

                                    {dosenList.map(
                                        (item) => (

                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* SDGs */}

                            <div>

                                <p className="mb-3 text-[10px] font-bold tracking-[0.15em] text-[#9AA0A6]">
                                    TAG SDGs
                                </p>

                                <div className="flex flex-wrap gap-1.5">

                                    {sdgsList.map(
                                        (sdg) => (

                                            <button
                                                key={sdg.id}
                                                type="button"
                                                title={`${sdg.code} - ${sdg.title}`}
                                                onClick={() =>
                                                    toggleSdg(
                                                        sdg.id
                                                    )
                                                }
                                                className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold transition ${
                                                    sdgFilter.includes(
                                                        sdg.id
                                                    )
                                                        ? "bg-[#1E4FBA] text-white"
                                                        : "bg-[#EEF2FB] text-[#1E4FBA] hover:bg-[#DCE7FA]"
                                                }`}
                                            >

                                                {sdg.code}

                                            </button>

                                        )
                                    )}

                                </div>

                            </div>

                        </div>

                    </aside>


                    {/* =====================================================
                        RESULTS
                    ===================================================== */}

                    <div className="min-w-0 flex-1">

                        <div className="mb-5 flex items-center gap-2">

                            <span className="text-sm font-medium text-[#9AA0A6]">

                                {filtered.length} TA ditemukan

                            </span>

                            {hasFilters && (

                                <button
                                    onClick={resetFilters}
                                    className="rounded-full bg-[#FFF4EC] px-3 py-1 text-xs font-semibold text-[#E8630A]"
                                >
                                    Hapus filter
                                </button>

                            )}

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                                <p className="text-sm text-red-600">
                                    {error}
                                </p>

                            </div>

                        )}


                        {/* EMPTY */}

                        {paged.length === 0 ? (

                            <div className="rounded-2xl bg-white py-20 text-center">

                                <div className="mb-4 text-4xl">
                                    🔍
                                </div>

                                <h2 className="font-semibold text-lg text-[#16367F]">
                                    Tidak ada TA ditemukan
                                </h2>

                                <p className="mt-2 text-sm text-[#9AA0A6]">
                                    Coba ubah kata kunci atau hapus
                                    filter yang aktif.
                                </p>

                            </div>

                        ) : view === "grid" ? (

                            /* =================================================
                               GRID
                            ================================================= */

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                {paged.map((ta) => (

                                    <button
                                        key={ta.id}
                                        type="button"
                                        onClick={() => {
                                            window.location.href =
                                                `/repository/${ta.id}`;
                                        }}
                                        className="group rounded-2xl bg-white p-5 text-left shadow-[0_2px_16px_rgba(30,79,186,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
                                    >

                                        {/* TOP */}

                                        <div className="mb-3 flex flex-wrap items-center gap-2">

                                            <span className="rounded-full bg-[#EEF2FB] px-2 py-1 text-[10px] font-bold text-[#1E4FBA]">

                                                {ta.programStudy?.degree ??
                                                    "Prodi"}

                                            </span>

                                            <span className="rounded-full bg-[#FFF4EC] px-2 py-1 text-[10px] font-semibold text-[#E8630A]">

                                                TA

                                            </span>

                                            <span className="ml-auto text-xs text-[#9AA0A6]">

                                                {ta.tahunMasuk}

                                            </span>

                                        </div>


                                        {/* TITLE */}

                                        <h3 className="mb-3 line-clamp-3 text-sm font-bold leading-snug text-[#16367F] transition-colors group-hover:text-[#1E4FBA]">

                                            {ta.judul}

                                        </h3>


                                        {/* INFO */}

                                        <div className="mb-4 space-y-1 text-xs text-[#9AA0A6]">

                                            <p>
                                                {ta.name} · {ta.nim}
                                            </p>

                                            <p>
                                                {ta.pembimbing?.name ??
                                                    "Pembimbing belum tersedia"}
                                            </p>

                                        </div>


                                        {/* SDGs */}

                                        {ta.sdgs.length > 0 && (

                                            <div className="flex flex-wrap gap-1">

                                                {ta.sdgs.map(
                                                    (sdg) => (

                                                        <span
                                                            key={sdg.id}
                                                            title={sdg.title}
                                                            className="rounded bg-[#1E4FBA] px-1.5 py-0.5 text-[9px] font-bold text-white"
                                                        >

                                                            {sdg.code}

                                                        </span>

                                                    )
                                                )}

                                            </div>

                                        )}

                                    </button>

                                ))}

                            </div>

                        ) : (

                            /* =================================================
                               LIST
                            ================================================= */

                            <div className="space-y-3">

                                {paged.map((ta) => (

                                    <button
                                        key={ta.id}
                                        type="button"
                                        onClick={() => {
                                            window.location.href =
                                                `/repository/${ta.id}`;
                                        }}
                                        className="group flex w-full items-start gap-5 rounded-2xl bg-white px-6 py-5 text-left shadow-[0_2px_16px_rgba(30,79,186,0.05)] transition hover:shadow-md"
                                    >

                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FB] text-xl">
                                            📄
                                        </div>

                                        <div className="min-w-0 flex-1">

                                            <h3 className="mb-1 line-clamp-2 text-sm font-bold leading-snug text-[#16367F] group-hover:text-[#1E4FBA]">

                                                {ta.judul}

                                            </h3>

                                            <p className="mb-2 text-xs text-[#9AA0A6]">

                                                {ta.name}
                                                {" · "}
                                                {ta.tahunMasuk}
                                                {" · "}
                                                {ta.pembimbing?.name ??
                                                    "Pembimbing belum tersedia"}

                                            </p>

                                            <div className="flex flex-wrap gap-1.5">

                                                <span className="rounded-full bg-[#EEF2FB] px-2 py-0.5 text-[10px] font-bold text-[#1E4FBA]">

                                                    {ta.programStudy?.degree ??
                                                        "Prodi"}

                                                </span>


                                                {ta.sdgs.map(
                                                    (sdg) => (

                                                        <span
                                                            key={sdg.id}
                                                            className="rounded bg-[#1E4FBA] px-1.5 py-0.5 text-[9px] font-bold text-white"
                                                        >

                                                            {sdg.code}

                                                        </span>

                                                    )
                                                )}

                                            </div>

                                        </div>


                                        <span className="mt-1 shrink-0 text-[#9AA0A6] transition group-hover:translate-x-1 group-hover:text-[#1E4FBA]">

                                            →

                                        </span>

                                    </button>

                                ))}

                            </div>

                        )}


                        {/* =====================================================
                            PAGINATION
                        ===================================================== */}

                        {totalPages > 1 && (

                            <div className="mt-8 flex items-center justify-center gap-2">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPage(
                                            (p) =>
                                                Math.max(
                                                    1,
                                                    p - 1
                                                )
                                        )
                                    }
                                    disabled={page === 1}
                                    className="rounded-xl border border-[#E8E4DC] px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    ← Prev
                                </button>


                                {Array.from(
                                    {
                                        length: totalPages
                                    },
                                    (_, i) => i + 1
                                ).map((p) => (

                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() =>
                                            setPage(p)
                                        }
                                        className={`h-9 w-9 rounded-xl text-sm font-medium ${
                                            page === p
                                                ? "bg-[#1E4FBA] text-white"
                                                : "text-slate-600 hover:bg-[#EEF2FB]"
                                        }`}
                                    >
                                        {p}
                                    </button>

                                ))}


                                <button
                                    type="button"
                                    onClick={() =>
                                        setPage(
                                            (p) =>
                                                Math.min(
                                                    totalPages,
                                                    p + 1
                                                )
                                        )
                                    }
                                    disabled={
                                        page ===
                                        totalPages
                                    }
                                    className="rounded-xl border border-[#E8E4DC] px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next →
                                </button>

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </main>

    );

}