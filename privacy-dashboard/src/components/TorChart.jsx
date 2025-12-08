import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

export default function TorChart({ data }) {
  return (
    <LineChart width={350} height={200} data={data}>
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="upload" stroke="#007bff" />
      <Line type="monotone" dataKey="download" stroke="#28a745" />
    </LineChart>
  );
}
