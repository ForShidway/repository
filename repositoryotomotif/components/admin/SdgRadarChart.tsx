"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

type SdgItem = {
    id: number;
    code: string;
    title: string;
    jumlah: number;
};

function SdgTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload as SdgItem;

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-lg max-w-[220px]">
            <p className="font-bold text-blue-600">{data.code}</p>
            <p className="mt-0.5 text-slate-600">{data.title}</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{data.jumlah} Tugas Akhir</p>
        </div>
    );
}

export default function SdgRadarChart({ data }: { data: SdgItem[] }) {
    const maxJumlah = Math.max(...data.map((item) => item.jumlah), 1);

    if (data.every((item) => item.jumlah === 0)) {
        return (
            <div className="flex h-80 items-center justify-center">
                <p className="text-sm text-slate-400">Belum ada data SDGs pada Tugas Akhir.</p>
            </div>
        );
    }

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} outerRadius="75%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="code"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, maxJumlah]}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                    />
                    <Radar
                        name="Tugas Akhir"
                        dataKey="jumlah"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                    />
                    <Tooltip content={<SdgTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}