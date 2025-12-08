import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

export default function AdblockChart({ data }) {
  return (
    <BarChart width={350} height={200} data={data}>
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="blocked" fill="#dc3545" />
    </BarChart>
  );
}

