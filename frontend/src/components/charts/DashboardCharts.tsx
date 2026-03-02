import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";


const inventoryData = [
  { name: "New", value: 120 },
  { name: "Used", value: 80 },
  { name: "Refurb", value: 45 },
];

const requestData = [
  { day: "Mon", requests: 5 },
  { day: "Tue", requests: 9 },
  { day: "Wed", requests: 4 },
  { day: "Thu", requests: 12 },
  { day: "Fri", requests: 7 },
];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* BAR CHART */}
      <div className="bg-gray-900 p-4 rounded-xl">
        <h2 className="text-lg font-semibold mb-3">
          Inventory by Condition
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inventoryData}>
            <XAxis dataKey="name" label={{ value: "Condition", position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LINE CHART */}
      <div className="bg-gray-900 p-4 rounded-xl">
        <h2 className="text-lg font-semibold mb-3">
          Requests Over Time
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={requestData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="requests" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}