const Input = ({ label, ...props }) => (
  <label className="block mb-4">
    {label && <span className="block mb-1 text-sm font-medium">{label}</span>}
    <input className="w-full px-3 py-2 border rounded" {...props} />
  </label>
);

export default Input;
