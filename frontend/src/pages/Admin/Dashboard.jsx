import { useEffect, useState } from "react";
import API from "../../api/axios";
import AdminLayout from "../../components/Layout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0 });

  useEffect(() => {
    API.get("/admin/users").then(res =>
      setStats(prev => ({ ...prev, users: res.data.length }))
    );
    API.get("/admin/orders").then(res =>
      setStats(prev => ({ ...prev, orders: res.data.length }))
    );
  }, []);

  const data = [
    { name: "Users", value: stats.users },
    { name: "Orders", value: stats.orders }
  ];

  return (
    <AdminLayout>
      <h1 className="text-xl md:text-2xl font-bold mb-4">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p>Total Users</p>
          <h2 className="text-xl">{stats.users}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Total Orders</p>
          <h2 className="text-xl">{stats.orders}</h2>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white p-4 rounded shadow h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminLayout>
  );
}