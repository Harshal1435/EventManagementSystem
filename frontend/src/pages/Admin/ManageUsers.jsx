import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);

  const [mainSection, setMainSection] = useState("user");
  const [activeSection, setActiveSection] = useState("userUpdate");

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMemberships, setLoadingMemberships] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [membershipForm, setMembershipForm] = useState({
    userId: "",
    title: "",
    price: "",
    duration: "",
  });

  const [editingMembershipId, setEditingMembershipId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const res = await API.get("/admin/users");

      const userData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.users)
        ? res.data.users
        : [];

      setUsers(userData);
    } catch (error) {
      console.error("Fetch users error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Failed to load users");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMemberships = async () => {
    try {
      setLoadingMemberships(true);

      const res = await API.get("/memberships");

      const membershipData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.memberships)
        ? res.data.memberships
        : [];

      setMemberships(membershipData);
    } catch (error) {
      console.error(
        "Fetch memberships error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.msg || "Failed to load memberships");
      setMemberships([]);
    } finally {
      setLoadingMemberships(false);
    }
  };

  const handleAddUser = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await API.post("/admin/users", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "user",
      });

      toast.success("User added successfully");
      setForm({ name: "", email: "", password: "" });

      await fetchUsers();
      setMainSection("user");
      setActiveSection("userUpdate");
    } catch (error) {
      console.error("Add user error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Failed to add user");
    }
  };

  const handleDeleteUser = async (id) => {
    const ok = window.confirm("Delete this user?");
    if (!ok) return;

    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      await fetchUsers();

      if (selectedUser?._id === id) {
        setSelectedUser(null);
        resetMembershipForm();
      }

      setMainSection("user");
      setActiveSection("userUpdate");
    } catch (error) {
      console.error("Delete user error:", error.response?.data || error.message);
      toast.error(error.response?.data?.msg || "Failed to delete user");
    }
  };

  const handleSelectUserForMembership = async (user) => {
    setSelectedUser(user);
    setMainSection("membership");
    setActiveSection("membershipAdd");
    setEditingMembershipId(null);
    setMembershipForm({
      userId: user._id,
      title: "",
      price: "",
      duration: "",
    });
    await fetchMemberships();
  };

  const handleAddMembership = async () => {
    if (
      !membershipForm.userId ||
      !membershipForm.title ||
      !membershipForm.price ||
      !membershipForm.duration
    ) {
      toast.error("Please fill all membership fields");
      return;
    }

    try {
      await API.post("/memberships", {
        userId: membershipForm.userId,
        title: membershipForm.title,
        price: Number(membershipForm.price),
        duration: membershipForm.duration,
      });

      toast.success("Membership added successfully");

      const currentUserId = membershipForm.userId;

      setMembershipForm({
        userId: currentUserId,
        title: "",
        price: "",
        duration: "",
      });

      await fetchMemberships();
      setMainSection("membership");
      setActiveSection("membershipUpdate");
    } catch (error) {
      console.error(
        "Add membership error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.msg || "Failed to add membership");
    }
  };

  const handleEditMembership = (item) => {
    const userObj = item.userId && typeof item.userId === "object" ? item.userId : null;

    if (userObj) {
      setSelectedUser(userObj);
    }

    setEditingMembershipId(item._id);
    setMembershipForm({
      userId: item.userId?._id || item.userId || "",
      title: item.title || "",
      price: item.price || "",
      duration: item.duration || "",
    });
    setMainSection("membership");
    setActiveSection("membershipAdd");
  };

  const handleUpdateMembership = async () => {
    if (!editingMembershipId) return;

    if (
      !membershipForm.userId ||
      !membershipForm.title ||
      !membershipForm.price ||
      !membershipForm.duration
    ) {
      toast.error("Please fill all membership fields");
      return;
    }

    try {
      await API.put(`/memberships/${editingMembershipId}`, {
        userId: membershipForm.userId,
        title: membershipForm.title,
        price: Number(membershipForm.price),
        duration: membershipForm.duration,
      });

      toast.success("Membership updated successfully");

      const currentUserId = membershipForm.userId;

      setEditingMembershipId(null);
      setMembershipForm({
        userId: currentUserId,
        title: "",
        price: "",
        duration: "",
      });

      await fetchMemberships();
      setMainSection("membership");
      setActiveSection("membershipUpdate");
    } catch (error) {
      console.error(
        "Update membership error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.msg || "Failed to update membership");
    }
  };

  const handleDeleteMembership = async (id) => {
    const ok = window.confirm("Delete this membership?");
    if (!ok) return;

    try {
      await API.delete(`/memberships/${id}`);
      toast.success("Membership deleted");
      await fetchMemberships();
    } catch (error) {
      console.error(
        "Delete membership error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.msg || "Failed to delete membership");
    }
  };

  const resetMembershipForm = () => {
    setEditingMembershipId(null);
    setMembershipForm({
      userId: selectedUser?._id || "",
      title: "",
      price: "",
      duration: "",
    });
  };

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const getMembershipsOfSelectedUser = () => {
    if (!selectedUser) return [];
    return memberships.filter(
      (item) => (item.userId?._id || item.userId) === selectedUser._id
    );
  };

  const selectedUserMemberships = getMembershipsOfSelectedUser();

  const buttonClass =
    "bg-white border-2 border-lime-500 rounded-xl text-black hover:bg-lime-50 transition shadow-sm";
  const smallButtonClass = `${buttonClass} w-[135px] h-[42px] text-[17px]`;
  const leftButtonClass = `${buttonClass} h-[42px] text-[17px] px-4`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#f8fafc] to-[#ecfeff] p-2 md:p-4">
      <div className="w-full max-w-[1150px] min-h-[500px] mx-auto bg-white border border-gray-200 rounded-3xl shadow-xl relative px-4 py-4 md:px-6">
        {/* top row */}
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className={`absolute top-4 left-4 md:left-8 w-[135px] h-[44px] text-[18px] ${buttonClass}`}
        >
          Home
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="absolute top-4 right-4 md:right-8 w-[135px] h-[44px] text-[18px] bg-white border-2 border-red-400 rounded-xl text-black hover:bg-red-50 transition shadow-sm"
        >
          LogOut
        </button>

        {/* top controls */}
        <div className="pt-20">
          <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-16">
            <div className="flex flex-col gap-6">
              <button
                type="button"
                onClick={async () => {
                  setMainSection("membership");
                  setActiveSection("membershipUpdate");
                  await fetchMemberships();
                }}
                className={`${leftButtonClass} w-[160px]`}
              >
                Membership
              </button>

              <button
                type="button"
                onClick={async () => {
                  setMainSection("user");
                  setActiveSection("userUpdate");
                  await fetchUsers();
                }}
                className={`${leftButtonClass} w-[180px]`}
              >
                User Management
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={async () => {
                  setMainSection("membership");
                  setActiveSection("membershipAdd");
                  resetMembershipForm();
                  await fetchMemberships();
                }}
                className={smallButtonClass}
              >
                Add
              </button>

              <button
                type="button"
                onClick={async () => {
                  setMainSection("membership");
                  setActiveSection("membershipUpdate");
                  await fetchMemberships();
                }}
                className={smallButtonClass}
              >
                Update
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainSection("user");
                  setActiveSection("userAdd");
                }}
                className={`${smallButtonClass} mt-4`}
              >
                Add
              </button>

              <button
                type="button"
                onClick={async () => {
                  setMainSection("user");
                  setActiveSection("userUpdate");
                  await fetchUsers();
                }}
                className={smallButtonClass}
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="mt-8">
          {/* USER ADD */}
          {mainSection === "user" && activeSection === "userAdd" && (
            <div className="bg-white rounded-2xl shadow-md border p-5 mt-4">
              <h2 className="text-2xl font-semibold mb-4 text-center">Add User</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="User Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-lime-400"
                />

                <input
                  type="email"
                  placeholder="User Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-lime-400"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={handleAddUser}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
                >
                  Add User
                </button>
              </div>
            </div>
          )}

          {/* USER TABLE / CARDS */}
          {mainSection === "user" && activeSection === "userUpdate" && (
            <div className="bg-white rounded-2xl shadow-md border p-5 mt-4">
              <h2 className="text-2xl font-semibold mb-4 text-center">
                User Management
              </h2>

              {loadingUsers ? (
                <p className="text-center text-gray-500">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-center text-gray-500">No users found</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {users.map((item) => (
                    <div
                      key={item._id}
                      className="border rounded-2xl p-4 shadow-sm hover:shadow-md transition bg-gradient-to-r from-white to-lime-50"
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => handleSelectUserForMembership(item)}
                      >
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{item.email}</p>
                        <p className="text-sm text-gray-500 mt-1 capitalize">
                          Role: {item.role}
                        </p>
                        <p className="text-sm text-lime-700 mt-3 font-medium">
                          Click to open membership form
                        </p>
                      </div>

                      <div className="flex gap-2 mt-4 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleSelectUserForMembership(item)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Add Membership
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(item._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MEMBERSHIP AREA */}
          {mainSection === "membership" && (
            <div className="grid lg:grid-cols-3 gap-6 mt-4">
              {/* Selected User Panel */}
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-md border p-5">
                <h2 className="text-xl font-semibold mb-4">Selected User</h2>

                {selectedUser ? (
                  <div className="rounded-2xl border border-lime-200 bg-lime-50 p-4">
                    <div className="w-14 h-14 rounded-full bg-lime-200 flex items-center justify-center text-xl font-bold text-lime-800 mb-3">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <p className="font-semibold text-gray-800">{selectedUser.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedUser.email}</p>
                    <p className="text-sm text-gray-500 mt-1 capitalize">
                      {selectedUser.role}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection("membershipAdd");
                        resetMembershipForm();
                      }}
                      className="mt-4 w-full bg-lime-600 text-white py-2 rounded-xl hover:bg-lime-700"
                    >
                      Open Membership Form
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed p-6 text-center text-gray-500">
                    Click a user to open their membership details
                  </div>
                )}
              </div>

              {/* Membership Form */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border p-5">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  {editingMembershipId ? "Update Membership" : "Add Membership"}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={selectedUser?.name || ""}
                    readOnly
                    placeholder="Selected User"
                    className="border p-3 rounded-xl bg-gray-50 outline-none"
                  />

                  <input
                    type="text"
                    value={selectedUser?.email || ""}
                    readOnly
                    placeholder="User Email"
                    className="border p-3 rounded-xl bg-gray-50 outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Membership Title"
                    value={membershipForm.title}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        title: e.target.value,
                      })
                    }
                    className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-lime-400"
                  />

                  <input
                    type="number"
                    placeholder="Price"
                    value={membershipForm.price}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        price: e.target.value,
                      })
                    }
                    className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-lime-400"
                  />

                  <input
                    type="text"
                    placeholder="Duration (e.g. 30 days)"
                    value={membershipForm.duration}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        duration: e.target.value,
                      })
                    }
                    className="border p-3 rounded-xl outline-none focus:ring-2 focus:ring-lime-400 md:col-span-2"
                  />
                </div>

                <div className="mt-5 text-center flex justify-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={
                      editingMembershipId
                        ? handleUpdateMembership
                        : handleAddMembership
                    }
                    className={`text-white px-6 py-3 rounded-xl ${
                      editingMembershipId
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    disabled={!selectedUser}
                  >
                    {editingMembershipId ? "Update Membership" : "Add Membership"}
                  </button>

                  {editingMembershipId && (
                    <button
                      type="button"
                      onClick={() => {
                        resetMembershipForm();
                        setActiveSection("membershipUpdate");
                      }}
                      className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Selected user memberships */}
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-md border p-5 overflow-x-auto">
                <h2 className="text-2xl font-semibold mb-4 text-center">
                  {selectedUser
                    ? `${selectedUser.name}'s Memberships`
                    : "Membership Management"}
                </h2>

                {loadingMemberships ? (
                  <p className="text-center text-gray-500">
                    Loading memberships...
                  </p>
                ) : selectedUser && selectedUserMemberships.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No memberships found for this user
                  </p>
                ) : !selectedUser && memberships.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No memberships found
                  </p>
                ) : (
                  <table className="w-full border rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-3 text-left">User</th>
                        <th className="border p-3 text-left">Email</th>
                        <th className="border p-3 text-left">Title</th>
                        <th className="border p-3 text-left">Price</th>
                        <th className="border p-3 text-left">Duration</th>
                        <th className="border p-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedUser ? selectedUserMemberships : memberships).map(
                        (item) => (
                          <tr key={item._id}>
                            <td className="border p-3">
                              {item.userId?.name || "N/A"}
                            </td>
                            <td className="border p-3">
                              {item.userId?.email || "N/A"}
                            </td>
                            <td className="border p-3">{item.title}</td>
                            <td className="border p-3">₹{item.price}</td>
                            <td className="border p-3">{item.duration}</td>
                            <td className="border p-3">
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleEditMembership(item)}
                                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteMembership(item._id)}
                                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeSection === "" && (
            <div className="mt-8 text-center text-gray-700">
              Select Add or Update
            </div>
          )}
        </div>
      </div>
    </div>
  );
}