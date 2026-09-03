//app/mahasiswa/tugas-akhir/create/[programStudyId]/page.tsx
"use client";

import { FormEvent, useState, useEffect, useMemo, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type MahasiswaInput = { 
    name: string; 
    nim : string
};

type Dosen = {
    id: number;
    name: string;
}

type Ruangan = {
    id:number;
    name:string;
}

type ProgramStudy = {
    id: number;
    name: string;
    degree: string;
}

type SDGs = {
    id :  number;
    code : string;
    title : string;
}

export default function CreateTugasAkhirPage({
    params,
}: {
    params: Promise<{ programStudyId: string }>;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { programStudyId } = use(params);
    const selectedCategory = searchParams.get("category") || "Tugas Akhir";

    const [mahasiswas, setMahasiswas] = useState<MahasiswaInput[]>([
        { name: "", nim: ""}
    ]);
    const [tahunMasuk, setTahunMasuk] = useState("");
    const [judul, setJudul] = useState("");
    const [mataKuliahRelevan, setMataKuliahRelevan] = useState("");

    const [ruanganId, setRuanganId] = useState("");
    const [pembimbingId, setPembimbingId] = useState("");
    const [pembimbing2Id, setPembimbing2Id] = useState("")
    const [dosenPaId, setDosenPaId] = useState("")
    const [file, setFile] = useState<File | null>(null);

    const [keywordInput, setKeywordInput] = useState("");
    const [keywords, setKeywords] = useState<string[]>([]);

    const [abstract, setAbstract] = useState("");
    const [ruangans, setRuangans] = useState<Ruangan[]>([]);
    const [dosens, setDosens] = useState<Dosen[]>([]);
    const [programStudy, setProgramStudy] = useState<ProgramStudy | null> (null);
    const [sdgs, setSdgs] = useState<SDGs[]>([]);
    const [selectedSDGs, setSelectedSDGs] = useState<number[]>([]);

    const sortedSdgs = useMemo(() => {
        return [...sdgs].sort((a, b) => {
            const numA = parseInt(a.code.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.code.replace(/\D/g, '')) || 0;
            return numA - numB;
    });
    }, [sdgs])

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");
    

    useEffect(() => {
        async function fetchData() {
            try{
                const [ ruanganResponse, dosenResponse, sdgsResponse, programStudyResponse ] = await Promise.all([
                    fetch("/api/ruangans"),
                    fetch("/api/dosens"),
                    fetch("/api/sdgs"),
                    fetch(`/api/program-studies/${programStudyId}`)
                ]);

                const ruanganData = await ruanganResponse.json();
                const dosenData = await dosenResponse.json();
                const sdgsData = await sdgsResponse.json();
                const programStudyData = await programStudyResponse.json();
                if (!ruanganResponse.ok) {
                    throw new Error (
                        ruanganData.message || "Gagal mengambil data ruangan"
                    )
                }

                if(!dosenResponse.ok) {
                    throw new Error (
                        dosenData.messagae || "Gagal mengambil data dosen"
                    )
                }

                if (!sdgsResponse.ok) {
                    throw new Error (
                        sdgsData.message || "Gagam mengambil data SDGS"
                    )
                }
                if (!programStudyResponse.ok) {
                    throw new Error(
                        programStudyData.message || "Gagal mengambil data program studi"
                    )
                }

                setRuangans(ruanganData);
                setDosens(dosenData);
                setSdgs(sdgsData);
                setProgramStudy(programStudyData)


            } catch (error) {
                console.error(error);
                setError( 
                    error instanceof Error ? error.message : "Gagal Mengambil data"
                );
            } finally {
                setLoadingData(false)
            }
            }
            fetchData();
        }, [programStudyId] );




    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const mahasiswaValid = mahasiswas.every((m) => m.name.trim() && m.nim.trim());
        const abstractWordCount = countWords(abstract);
        if (!mahasiswaValid || !tahunMasuk || !judul.trim() || !pembimbingId || !programStudyId ||selectedSDGs.length === 0)    {
            setError("Semua data Tugas Akhir harus di isi, minimal satu SDGS harus dipilih");
            return;
        }

        try{
            setLoading(true);

            const formData = new FormData();
            formData.append("mahasiswas", JSON.stringify(
                mahasiswas.map((m) => ({ name: m.name.trim(), nim: m.nim.trim() }))
            ));

            formData.append("tahunMasuk", tahunMasuk);
            formData.append("judul", judul.trim());
            if (abstract.trim()) {
                formData.append("abstract", abstract.trim());
            }
            if (abstractWordCount > 350) {
                setError(`Abstract maksimal 350 kata, (saat ini ${abstractWordCount} kata)`);
                return;
            }
            if (mataKuliahRelevan.trim()) {
                formData.append("mataKuliahRelevan", mataKuliahRelevan.trim());
            }
            if (ruanganId) {
                formData.append("ruanganId", ruanganId);
            }
            formData.append("pembimbingId", pembimbingId);
            if(pembimbing2Id) {
                formData.append("pembimbing2Id", pembimbing2Id)
            }
            if(dosenPaId) {
                formData.append("dosenPaId", dosenPaId)
            }
            formData.append("programStudyId", programStudyId);
            formData.append("sdgsId", JSON.stringify(selectedSDGs));
            formData.append("keywords", JSON.stringify(keywords));
            if (file) {
                formData.append("file", file);
            }

            const response = await fetch("/api/tugas-akhirs", {
                method: "POST",
                body: formData,
                })                  

            const data = await response.json();
            if (!response.ok)  {
                throw new Error(
                    data.message || "Gagal Menambakan Tugas Akhir"
                    
                )
            }

            alert("Tugas Akhir berhasil ditambahkan!");
            router.push(`/mahasiswa/${programStudyId}`);
            router.refresh();
        } catch (error) {
            console.error(error);
                setError(
                    error instanceof Error ? error.message : "Terjadi kessaalaan "
                )
            
        } finally {
            setLoading(false);
        }
    }

    function handleSDGsChange(sdgId: number) {
        setSelectedSDGs((current) => {
            if (current.includes(sdgId)) {
                return current.filter((id) => id !== sdgId);
            }

            return [...current, sdgId];
        });
    }

   function addKeyword() {
        const parts = keywordInput
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k.length > 0);
        if (parts.length === 0) return;
        setKeywords((current) => {
            const gabungan = [...current];
            for (const kata of parts) {
                if (gabungan.length >= 5) break;
                if (!gabungan.includes(kata)) {
                    gabungan.push(kata);
                }
            }
            return gabungan;
        });
        setKeywordInput("");
    }

    function removeKeyword(kata: string) {
        setKeywords((current) => current.filter((k) => k !==kata));
    }


    function updateMahasiswa(index:number, field:"name"|"nim", value:string) {
        setMahasiswas((current) => current.map((m, i) => (i === index ? {...m, [field]: value }: m)))
    }

    function addMahasiswa() {
        setMahasiswas((current) => {
            if (current.length >= 3) return current;
            return [...current, { name: "", nim: ""}]
        })
    }

    function removeMahasiswa(index:number) {
        setMahasiswas((current) => current.filter((_,i) => i !== index));
    }

    function countWords(text: string) {
        return text.trim().split(/\s+/).filter(Boolean).length;
    }

    return (
        <main className="min-h-screen bg-[#F4F9F9] p-8" >
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Tambah {selectedCategory}</h1>
                    <p className="mt-2 text-gray-600">Tambah data {selectedCategory.toLowerCase()} mahasiswa untuk program studi ini.</p>
                </div>
                
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {mahasiswas.map((m, index) => (
                                <div key={index} className="rounded-lg border border-slate-200 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-700">Mahasiswa {index + 1}</p>
                                        {index > 0 && (
                                            <button type="button" onClick={() => removeMahasiswa(index)} className="text-xs font-semibold text-red-500 hover:text-red-700">Hapus</button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor={`name-${index}`} className="mb-2 block text-sm font-medium text-gray-700">Nama Mahasiswa</label>
                                            <input
                                                type="text"
                                                id={`name-${index}`}
                                                value={m.name}
                                                onChange={(e) => updateMahasiswa(index, "name", e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                                placeholder="Contoh: Budi Santoso"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor={`nim-${index}`} className="mb-2 block text-sm font-medium">NIM</label>
                                            <input
                                                id={`nim-${index}`}
                                                type="text"
                                                value={m.nim}
                                                onChange={(e) => updateMahasiswa(index, "nim", e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                                placeholder="Contoh: 23123456"
                                            />
                                        </div>
                                    </div>

                                    {index === mahasiswas.length - 1 && mahasiswas.length < 3 && (
                                        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={false}
                                                onChange={addMahasiswa}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            Ada mahasiswa lain yang terlibat
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>
                            
                       
                        <div>
                            <label htmlFor="tahunMasuk" className="mb-2 block text-sm font-medium">
                                Tahun
                            </label>
                            <input id="tahunMasuk" type="number" value={tahunMasuk} onChange={(e) => setTahunMasuk( e.target.value)} className="w-full rounded-lg border px-4 py-3" placeholder="2020"/>
                        </div>

                        <div>
                            <label htmlFor="judul" className="mb-2 block text-sm font-medium">
                                Judul Tugas Akhir
                            </label>
                            <textarea id="judul" value={judul} onChange={(e) => setJudul(e.target.value)  }  rows={5} className="w-full rounded-lg border px-4 py-3" placeholder="Masukkan judul tugas akhir"/>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label htmlFor="abstrak" className="block text-sm font-medium">
                                    Abstract <span className="font-normal text-slate-400">(opsional, maksimal 350 kata)</span>
                                </label>
                                <span className={`text-xs font-medium ${countWords(abstract) > 350 ? "text-red-500" : "text-slate-400"}`}>
                                    {countWords(abstract)} / 350 kata
                                </span>
                            </div>
                            <textarea
                                id="abstrak"
                                value={abstract}
                                onChange={(e) => setAbstract(e.target.value)}
                                rows={8}
                                className={`w-full rounded-lg border border-black px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                                    countWords(abstract) > 350
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                        : "border-black focus:border-blue-500 focus:ring-blue-500/10"
                                }`}
                                placeholder="Tuliskan ringkasan singkat penelitian Tugas Akhir..."
                            />
                        </div>

                        <div>
                            <label htmlFor="ruangan" className="mb-2 block text-sm font-medium">
                                Tempat Pelaksanaan TA
                            </label>
                            <select id="ruangan" value={ruanganId}  onChange={(e) => setRuanganId( e.target.value ) } className="w-full rounded-lg border px-4 py-3" >
                                <option value="">
                                    -- Pilih Ruangan --
                                </option>
                                {ruangans.map(
                                    (ruangan) => (
                                        <option key={ruangan.id} value={ruangan.id} >
                                            {ruangan.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="mataKuliahRelevan" className="mb-2 block text-sm font-medium">
                                Mata Kuliah yang Relevan
                            </label>
                            <input  id="mataKuliahRelevan" type="text" value={ mataKuliahRelevan }
                                onChange={(e) => setMataKuliahRelevan( e.target.value ) }
                                className="w-full rounded-lg border px-4 py-3"
                                placeholder="Contoh: Pemrograman Web"
                            />
                        </div>

                        <div>
                            <label htmlFor="keywordInput" className="mb-2 block text-sm font-medium text-gray-700">
                                Kata Kunci <span className="font-normal text-slate-400">(maksimal 5)</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="keywordInput"
                                    type="text"
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addKeyword();
                                        }
                                    }}
                                    disabled={keywords.length >= 5}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-400"
                                    placeholder={keywords.length >= 5 ? "Batas maksimal tercapai" : "Contoh: Machine Learning"}
                                />
                                <button
                                    type="button"
                                    onClick={addKeyword}
                                    disabled={keywords.length >= 5}
                                    className="shrink-0 rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    + Tambah
                                </button>
                            </div>
                        </div>
                        {keywords.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {keywords.map((kata) => (
                                    <span
                                        key={kata}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                                    >
                                        {kata}
                                        <button
                                            type="button"
                                            onClick={() => removeKeyword(kata)}
                                            className="text-blue-400 hover:text-blue-700"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div>
                            <label htmlFor="pembimbing" className="mb-2 block text-sm font-medium">
                                Dosen Pembimbing I
                            </label>

                            <select id="pembimbing" value={pembimbingId} onChange={(e) =>  setPembimbingId( e.target.value ) } className="w-full rounded-lg border px-4 py-3" >
                                <option value="">
                                    -- Pilih Dosen Pembimbing --
                                </option>
                                {dosens.map(
                                    (dosen) => (
                                        <option key={dosen.id}  value={dosen.id} >
                                            {dosen.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="pembimbing" className="mb-2 block text-sm font-medium">
                                Dosen Pembimbing II
                            </label>

                            <select id="pembimbing" value={pembimbing2Id} onChange={(e) =>  setPembimbing2Id( e.target.value ) } className="w-full rounded-lg border px-4 py-3" >
                                <option value="">
                                    -- Pilih Dosen Pembimbing --
                                </option>
                                {dosens .filter((dosen) => String(dosen.id) !== pembimbingId)
                                    .map((dosen) => (
                                        <option key={dosen.id}  value={dosen.id} >
                                            {dosen.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dosenPa" className="mb-2 block text-sm font-medium">
                                Dosen PA
                            </label>
                            <select id="dosenPa" value={dosenPaId} onChange={(e) => setDosenPaId(  e.target.value ) } className="w-full rounded-lg border px-4 py-3" >
                                <option value="">
                                    -- Pilih Dosen PA --
                                </option>
                                {dosens.map(
                                    (dosen) => (
                                        <option  key={dosen.id}  value={dosen.id}  >
                                            {dosen.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="" className="mb-2 block text-sm font-medium text-gray-700">Program Studi</label>
                            <div className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                                {programStudy ? (
                                    <div>
                                        <p className="font-semibold text-blue-800"> {programStudy.degree} {programStudy.name}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500"> Memuat Program Studi</p>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <label className="mb-3 block text-sm font-medium text-gray-700">SDGs yang Relevan</label>
                        </div>
                        <div className="rounded-lg border border-slate-200 p-4">
                            {sortedSdgs.length === 0 ? (
                                <p className="text-sm text-slate-500">Belum ada data SDGs</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {sortedSdgs.map((sdgs) => {
                                        const isSelected = selectedSDGs.includes(sdgs.id);
                                        return (
                                            <label
                                                key={sdgs.id}
                                                className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition ${
                                                    isSelected
                                                        ? "border-blue-300 bg-blue-50"
                                                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSDGsChange(sdgs.id)}
                                                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800">{sdgs.code}</p>
                                                    <p className="line-clamp-2 text-xs text-slate-500">{sdgs.title}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {selectedSDGs.length > 0 && (
                                <p className="mt-3 text-sm font-medium text-blue-600">
                                    {selectedSDGs.length} SDGs dipilih
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="file" className="mb-2 block text-sm font-medium">File Tugas Akhir</label>
                        </div>
                        <input type="file" id="file" accept=".pdf, .doc, .docx" onChange={(e) =>{
                            const selectedFile = e.target.files?.[0] || null;
                            if (!selectedFile) {
                                setFile(null);
                                return;
                            }
                            const maxSize = 200*1024*1024;
                            if (selectedFile.size > maxSize) {
                                setError("ukuran file maksimal adalah  200 MB");
                                setFile(null);
                                e.target.value ="";
                                return;
                            }
                            setError("");
                            setFile(selectedFile);
                        }} className="w-full rounded-lg border px-4"/>
                        <p>Format : PDF Maksimal 200 Mb</p>
                        {file && (
                            <p className="mt-2 text-sm text-gray-600"> 
                                File dipilih: <strong>{file.name}</strong>
                            </p>
                        )}

                        {error && (
                            <div className="rounded-lg border border-red-200  bg-red-50 px-4 py-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button type="button" onClick={() => router.push(`/mahasiswa/${programStudyId}`)}>
                                Batal
                            </button>
                            <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                                {loading ? "Menyimpan...." : "Simpan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )

}