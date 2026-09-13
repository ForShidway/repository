"use client";

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

type SdgChartItem = {
    id: number;
    code: string;
    title: string;
    jumlahTA: number;
    jumlahArtikel: number;
};

function SdgTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload as SdgChartItem;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-lg max-w-[240px]">
            <p className="font-bold text-blue-700">{data.code}</p>
            <p className="mt-0.5 text-slate-600 leading-snug">{data.title}</p>
            <div className="mt-2 flex flex-col gap-1">
                <p className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-blue-500 shrink-0" />
                    <span className="text-slate-700 font-semibold">{data.jumlahTA} Tugas Akhir</span>
                </p>
                <p className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-emerald-500 shrink-0" />
                    <span className="text-slate-700 font-semibold">{data.jumlahArtikel} Artikel Jurnal</span>
                </p>
            </div>
        </div>
    );
}

export default function SdgsRadarChart({ data }: { data: SdgChartItem[] }) {
    const allZero = data.every((item) => item.jumlahTA === 0 && item.jumlahArtikel === 0);

    if (allZero) {
        return (
            <div className="flex h-80 items-center justify-center">
                <p className="text-sm text-slate-400">Belum ada data SDGs pada Tugas Akhir maupun Artikel Jurnal.</p>
            </div>
        );
    }

    const maxVal = Math.max(
        ...data.map((item) => Math.max(item.jumlahTA, item.jumlahArtikel)),
        1
    );

    return (
        <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} outerRadius="75%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="code"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, maxVal]}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                    />
                    <Radar
                        name="Tugas Akhir"
                        dataKey="jumlahTA"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.25}
                        strokeWidth={2}
                    />
                    <Radar
                        name="Artikel Jurnal"
                        dataKey="jumlahArtikel"
                        stroke="#059669"
                        fill="#10b981"
                        fillOpacity={0.2}
                        strokeWidth={2}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
                    />
                    <Tooltip content={<SdgTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
