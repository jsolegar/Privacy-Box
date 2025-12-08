import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function TorChart({ data }) {
  if (!data || data.length === 0) return <p>No chart data available</p>;

  return (
    <div style={{ width: "100%", height: 250 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" label={{ value: "t", position: "insideBottomRight", offset: -5 }} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="upload" stroke="#8884d8" dot={false} />
          <Line type="monotone" dataKey="download" stroke="#82ca9d" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
