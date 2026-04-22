const Navbar = () => (
  <header className="w-full px-4 py-3 bg-white border-b shadow-sm">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="text-xl font-bold">VMS</div>
      <nav className="space-x-4">
        <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Home</a>
        <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Profile</a>
      </nav>
    </div>
  </header>
);

export default Navbar;
