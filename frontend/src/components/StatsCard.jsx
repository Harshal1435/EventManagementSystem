const StatsCard = ({ label, value }) => (
  <div className="p-4 bg-white rounded shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold">{value}</p>
  </div>
);

export default StatsCard;
