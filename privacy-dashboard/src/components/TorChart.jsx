// TorChart.jsx (FIX per dataKey="time")
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function TorChart({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ opacity: 0.7, margin: 0 }}>No chart data available</p>;
  }

  // Auto-escala perquè valors petits es vegin
  const maxVal = Math.max(
    0,
    ...data.map((d) => Math.max(Number(d.upload || 0), Number(d.download || 0)))
  );
  const top = Math.max(1, maxVal * 1.6);

  const axis = "rgba(255,255,255,0.70)";
  const grid = "rgba(255,255,255,0.12)";

  return (
    <div style={{ width: "100%", height: 250, minHeight: 250 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={grid} />

          <XAxis
            dataKey="time"
            minTickGap={24}
            tick={{ fill: axis, fontSize: 12 }}
            axisLine={{ stroke: axis }}
            tickLine={{ stroke: axis }}
          />

          <YAxis
            width={44}
            domain={[0, top]}
            tick={{ fill: axis, fontSize: 12 }}
            axisLine={{ stroke: axis }}
            tickLine={{ stroke: axis }}
            allowDecimals
          />

          <Tooltip
            contentStyle={{
              background: "rgba(10,12,18,0.95)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              color: "rgba(255,255,255,0.9)",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.85)" }}
            formatter={(value, name) => [`${Number(value).toFixed(2)} KB/s`, name]}
          />

          <Legend wrapperStyle={{ color: axis }} />

          <Line
            type="linear"
            dataKey="download"
            name="download"
            dot={false}
            stroke="rgba(80, 170, 255, 0.95)"
            strokeWidth={2.5}
            isAnimationActive={false}
            connectNulls
          />
          <Line
            type="linear"
            dataKey="upload"
            name="upload"
            dot={false}
            stroke="rgba(60, 230, 180, 0.95)"
            strokeWidth={2.5}
            isAnimationActive={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
