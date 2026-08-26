"use client";

import { FormEvent, useState, useEffect } from "react";
import {useRouter} from "next/navigation";


type Dosen = {
    id: number;
    name: string;
}

type Ruangan = {
    id:number;
    name:string;
}

type SDGs = {
    id :  number;
    code : string;
    title : string;
}

export default function CreateTugasAkhirPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [tahunMasuk, setTahunMasuk] = useState("");
    const [nim, setNim] =  useState("");
    const [judul, setJudul] = useState("");
    const [mataKuliahRelevan, setMataKuliahRelevan] = useState("");

    const [ruanganId, setRuanganId] = useState("");
    const [pembimbingId, setPembimbingId] = useState("");
    const [dosenPaId, setDosenPaId] = useState("")
    const [file, setFile] = useState<File | null>(null);

    const [ruangans, setRuangans] = useState<Ruangan[]>([]);
    const [dosens, setDosens] = useState<Dosen[]>([]);
    const [sdgs, setSdgs] = useState<SDGs[]>([]);
    const [selectedSDGs, setSelectedSDGs] = useState<number[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");
    

    useEffect(() => {
        async function fetchData() {
            try{
                const [ ruanganResponse, dosenResponse, sdgsResponse ] = await Promise.all([
                    fetch("/api/ruangans"),
                    fetch("/api/dosens"),
                    fetch("/api/sdgs")
                ]);

                const ruanganData = await ruanganResponse.json();
                const dosenData = await dosenResponse.json();
                const sdgsData = await sdgsResponse.json();
                if (!ruanganResponse.ok) {
                    throw new Error (
                        ruanganData.message || "Gagal mengambil data ruangan"
                    )
                }

                if(!dosenResponse) {
                    throw new Error (
                        dosenData.messagae || "Gagal mengambil data dosen"
                    )
                }

                if (!sdgsResponse) {
                    throw new Error (
                        sdgsData.message || "Gagam mengambil data SDGS"
                    )
                }

                setRuangans(ruanganData);
                setDosens(dosenData);
                setSdgs(sdgsData);


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
        },[] );




    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!name.trim() || !tahunMasuk || !nim.trim() || !judul.trim() || !mataKuliahRelevan.trim() || !ruanganId || !pembimbingId || !dosenPaId || selectedSDGs.length === 0)    {
            setError("Semua data Tugas Akhir harus di isi, minimal satu SDGS harus dipilih");
            return;
        }

        try{
            setLoading(true);

            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("tahunMasuk", tahunMasuk);
            formData.append("nim", nim.trim());
            formData.append("judul", judul.trim());
            formData.append("mataKuliahRelevan", mataKuliahRelevan.trim());
            formData.append("ruanganId", ruanganId);
            formData.append("pembimbingId", pembimbingId);
            formData.append("dosenPaId", dosenPaId);
            formData.append("sdgsId", JSON.stringify(selectedSDGs));
            if (file) {
                formData.append("file", file);
            }

            const response = await fetch("/api/tugas-akhirs", {
                method: "POST",
                })                  

            const data = await response.json();
            if (!response.ok)  {
                throw new Error(
                    data.message || "Gagal Menambakan Tugas Akhir"
                    
                )
            }
            router.push("/tugas-akhirs");
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


    return (
        <main className="min-h-screen bg-gray-50 p-8" >
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold txt-gray-900"> Tambah Tugas Akhir</h1>
                    <p className="mt-2 text-gray-600"> Tambahkan data Tugas Akhir mahasiswa</p>
                </div>
                <div className="rounded-xl border bg-whte p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label  htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700"> 
                                Nama Mahasiswa</label>
                            <input type="text" id="name" value={name} onChange={(event) => setName(event.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="tahunMasuk" className="mb-2 block text-sm font-medium">
                                Tahun Masuk
                            </label>
                            <input id="tahunMasuk" type="number" value={tahunMasuk} onChange={(e) => setTahunMasuk( e.target.value)} className="w-full rounded-lg border px-4 py-3" placeholder="2024"/>
                        </div>

                        <div>
                            <label htmlFor="nim" className="mb-2 block text-sm font-medium">
                                NIM
                            </label>
                            <input id="nim" type="text" value={nim} onChange={(e) => setNim(e.target.value) } className="w-full rounded-lg border px-4 py-3" placeholder="Contoh: 23123456" />
                        </div>

                        <div>
                            <label htmlFor="judul"  className="mb-2 block text-sm font-medium" >
                                Judul Tugas Akhir
                            </label>
                            <textarea id="judul" value={judul} onChange={(e) => setJudul(e.target.value)  }  rows={5} className="w-full rounded-lg border px-4 py-3" placeholder="Masukkan judul tugas akhir"/>
                        </div>
                        
                        <div>
                            <label htmlFor="ruangan" className="mb-2 block text-sm font-medium" >
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
                            <label  htmlFor="mataKuliahRelevan" className="mb-2 block text-sm font-medium" >
                                Mata Kuliah yang Relevan
                            </label>
                            <input  id="mataKuliahRelevan" type="text" value={ mataKuliahRelevan }
                                onChange={(e) => setMataKuliahRelevan( e.target.value ) }
                                className="w-full rounded-lg border px-4 py-3"
                                placeholder="Contoh: Pemrograman Web"
                            />
                        </div>


                        <div>
                            <label  htmlFor="pembimbing"  className="mb-2 block text-sm font-medium" >
                                Dosen Pembimbing
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
                            <label  htmlFor="dosenPa" className="mb-2 block text-sm font-medium" >
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
                            <label className="mb-3 block text-sm font-medium text-gray-700">SDGs yang Relevan</label>
                        </div>
                        <div className="space-y-3 rounded-lg border border-gray-300 p-4">
                            {sdgs.length === 0 ?(
                                <p className="text-sm text-gray-500">Belum ada data SDGs</p>
                            ): (
                                sdgs.map((sdgs) => (
                                    <label key={sdgs.id} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-gray-50" >
                                        <input type="checkbox" checked={selectedSDGs.includes(sdgs.id)} onChange={() => handleSDGsChange(sdgs.id)} className="mt-1 h-4 w-4" />
                                        <div> 
                                            <p className="font-medium text-gray-800"> {sdgs.code}-{sdgs.title}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                            {selectedSDGs.length > 0 && (
                                <p>{selectedSDGs.length}SDG diplih </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="file" className="mb-2 block text-sm font-medium">File Tugas Akhir</label>
                        </div>
                        <input type="file" id="file" accept=".pdf, .pdf, .docx" onChange={(e) =>{
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
                        }} className="w-full rounde-lg border px-4"/>
                        <p>Format : PDF, DOC, DOCX. Maksimal 200 Mb</p>
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
                            <button type="button" onClick={() => router.push("/tugas-akhirs")}>
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