import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  // ✅ 1. Destructure the 'logout' function from your context
  const { user, logout } = useContext(UserContext);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ProjectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const navigate = useNavigate();

  // --- NO CHANGES to createProject, useEffect, or handleDeleteProject ---
  function createProject() {
    axios
      .post("/projects/create", {
        name: ProjectName,
      })
      .then((res) => {
        setProject((prevProjects) => [...prevProjects, res.data.project]);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    axios
      .get("/projects/all")
      .then((res) => {
        setProject(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleDeleteProject = (projectId, e) => {
    e.stopPropagation();
    axios
      .delete(`/projects/delete/${projectId}`)
      .then(() => {
        setProject((prevProjects) =>
          prevProjects.filter((p) => p._id !== projectId)
        );
      })
      .catch((err) => {
        console.error("Failed to delete project:", err);
      });
  };
  
  // ==================== NEW: LOGOUT FUNCTIONALITY ====================
  /**
   * Handles the complete logout process.
   */
  const handleLogout = async () => {
    try {
      // 1. Call your existing backend logout endpoint
      await axios.get("/users/logout");

      // 2. Clear the user state and token on the frontend via context
      logout();

      // 3. Redirect the user to the login page
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
      // As a fallback, ensure the user is logged out on the frontend
      // even if the backend call fails for some reason.
      logout();
      navigate("/login");
    }
  };
  // ====================================================================

  return (
    <>
      <main className="bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-700">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">
                Your Projects
              </h1>
              <p className="mt-1 text-gray-400">
                Welcome back, {user?.email || "User"}!
              </p>
            </div>

            {/* ✅ 2. A container for your header buttons */}
            <div className="flex items-center gap-6 mt-4 sm:mt-0">
              {/* ✅ 3. The new Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-400 hover:text-white font-semibold transition-colors duration-200"
                title="Logout"
              >
                <i className="ri-logout-box-r-line text-xl"></i>
                <span className="hidden sm:inline">Logout</span>
              </button>
              
              <button
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition"
                onClick={() => setIsModalOpen(true)}
              >
                <i className="ri-add-line text-xl"></i>
                <span className="hidden sm:inline">New Project</span>
              </button>
            </div>
          </header>

          {/* ... The rest of your JSX remains completely unchanged ... */}
          <div className="mt-8">
            {project.length === 0 ? (
              <div className="text-center py-16 px-6 border-2 border-dashed border-gray-700 rounded-lg">
                <i className="ri-folder-open-line text-5xl text-gray-600"></i>
                <h3 className="mt-2 text-xl font-semibold text-gray-300">No projects found</h3>
                <p className="mt-1 text-gray-500">Get started by creating a new project.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {project.map((p) => (
                  <div
                    onClick={() => navigate(`/project`, { state: { project: p } })}
                    key={p._id}
                    className="group bg-gray-800 border border-gray-700 rounded-xl shadow-sm 
                               transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 hover:border-blue-700 hover:-translate-y-1 cursor-pointer 
                               flex flex-col justify-between"
                  >
                    <div className="p-5">
                      <h2 className="text-xl font-bold text-gray-100 truncate">
                        {p.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-3 text-gray-400">
                        <i className="ri-group-line text-lg"></i>
                        <p className="text-sm font-medium">
                          {p.users.length} Partner{p.users.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-900/50 p-3 flex items-center justify-end rounded-b-xl border-t border-gray-700">
                      <button
                        onClick={(e) => handleDeleteProject(p._id, e)}
                        className="text-gray-500 hover:text-red-400 transition-colors duration-200 p-1.5 rounded-full hover:bg-red-500/10"
                        title="Delete Project"
                      >
                        <i className="ri-delete-bin-6-line text-xl"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ... Modal JSX remains unchanged ... */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300">
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all duration-300">
              <h2 className="text-2xl font-bold text-gray-100 mb-5">
                Create a New Project
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createProject();
                  setTimeout(() => {
                    setIsModalOpen(false);
                    setProjectName("");
                  }, 100);
                }}
              >
                <label className="block mb-2 text-sm font-medium text-gray-400">
                  Project Name
                </label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={ProjectName}
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 placeholder:text-gray-500"
                  placeholder="e.g., 'My Next Big Idea'"
                  required
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-5 py-2 bg-gray-600 text-gray-200 font-semibold rounded-md hover:bg-gray-500 transition"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
};
export default Home;