'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// 🟢 In-import ang updateDeveloper at deleteDeveloper mula sa API module
import api, { deleteDeveloper, updateDeveloper } from '@/lib/api';
import Cookies from 'js-cookie';

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
  project_id: number;
  assigned_to?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [developers, setDevelopers] = useState<User[]>([]);

  // Project Form State
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDeveloper, setSelectedDeveloper] = useState('');

  // 🟡 [BAGONG DAGDAG]: State para sa Edit Developer Modal & Form
  const [editingDev, setEditingDev] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editCustom, setCustom] = useState('');

  const router = useRouter();

  useEffect(() => {
    const userData = Cookies.get('user');
    if (!userData) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    fetchProjects();
    fetchTasks();

    // Fetch developers list if Admin or Project Manager
    if (parsedUser.role === 'admin' || parsedUser.role === 'project_manager') {
      fetchDevelopers();
    }
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const res = await api.get('/developers');
      setDevelopers(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🟢 Handler para sa pagbura ng developer gamit ang API
  const handleDeleteDeveloper = async (id: number) => {
    if (!confirm('Sigurado ka bang buburahin mo ang developer na ito?')) return;

    try {
      const res = await deleteDeveloper(id);
      if (res.status === 'success') {
        fetchDevelopers(); // Refresh ang listahan pagka-delete
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting developer');
    }
  };

  // 🟡 [BAGONG DAGDAG]: Function para buksan ang Edit Modal at i-populate ang lumang data
  const handleOpenEditModal = (dev: User) => {
    setEditingDev(dev);
    setEditName(dev.name);
    setEditEmail(dev.email);
    setEditRole(dev.role);
  };

  // 🟡 [BAGONG DAGDAG]: Handler para i-submit ang na-edit na developer information
  const handleUpdateDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDev) return;

    try {
      await updateDeveloper(editingDev.id, {
        name: editName,
        email: editEmail,
      });
      setEditingDev(null);
      fetchDevelopers(); // Refresh ang listahan pagkatapos mag-update
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating developer');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', {
        title: newProjectTitle,
        description: newProjectDesc,
      });
      setNewProjectTitle('');
      setNewProjectDesc('');
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating project');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title: newTaskTitle,
        project_id: selectedProject,
        assigned_to: selectedDeveloper,
        status: 'pending',
      });
      setNewTaskTitle('');
      setSelectedProject('');
      setSelectedDeveloper('');
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleLogout = async () => {
    try {
      const token = Cookies.get('token');
      await api.post('/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) { 
      console.warn('Logout session already invalid on server:', err);
    } finally {
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/';
    }
  };

  // 🔴🟡🟢 Helper function para magbalik ng color indicator batay sa Task Status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500' };
      case 'in_progress':
        return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500' };
      default:
        return { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500' };
    }
  };

  if (!user) return <div className="p-8 text-center text-white bg-slate-900 min-h-screen">Loading...</div>;

  const isManagerOrAdmin = user.role === 'admin' || user.role === 'project_manager';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 relative">
      {/* Navigation Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center pb-6 border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-indigo-500 inline-block"></span>
            CyphLab Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Welcome back, <span className="text-white font-semibold">{user.name}</span>{' '}
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 uppercase border border-indigo-700 ml-1">
              {user.role}
            </span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition flex items-center gap-1.5"
        >
          <span className="h-2 w-2 rounded-full bg-white inline-block"></span>
          Logout
        </button>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        
        {/* Left Column: Forms (Admin / Project Manager Only) */}
        {isManagerOrAdmin && (
          <div className="space-y-6">
            
            {/* Create Project Form */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h2 className="text-lg font-bold mb-4 text-indigo-300 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 inline-block"></span>
                Create Project
              </h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Project Title</label>
                  <input
                    type="text"
                    required
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm"
                    placeholder="e.g. Website Redesign"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Description</label>
                  <textarea
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm"
                    rows={3}
                    placeholder="Project details..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-sm transition flex items-center justify-center gap-2"
                >
                  <span className="h-2 w-2 rounded-full bg-indigo-200"></span>
                  + Add Project
                </button>
              </form>
            </div>

            {/* Create & Assign Task Form */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h2 className="text-lg font-bold mb-4 text-indigo-300 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block"></span>
                Assign Task
              </h2>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Select Project</label>
                  <select
                    required
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm"
                    placeholder="e.g. Design Landing Page"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Assign to Developer</label>
                  <select
                    required
                    value={selectedDeveloper}
                    onChange={(e) => setSelectedDeveloper(e.target.value)}
                    className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm"
                  >
                    <option value="">-- Choose Developer --</option>
                    {developers.map((dev) => (
                      <option key={dev.id} value={dev.id}>
                        {dev.name} ({dev.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded font-semibold text-sm transition flex items-center justify-center gap-2"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-200"></span>
                  + Assign Task
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Right Column: Projects, Tasks & Developers Lists */}
        <div className={`space-y-6 ${isManagerOrAdmin ? 'md:col-span-2' : 'md:col-span-3'}`}>
          
          {/* Projects View */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-lg font-bold mb-4 text-indigo-300 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-400 inline-block"></span>
              Projects Overview
            </h2>
            <div className="space-y-3">
              {projects.length === 0 ? (
                <p className="text-sm text-slate-400">No projects found.</p>
              ) : (
                projects.map((proj) => (
                  <div key={proj.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 flex items-start gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                    <div>
                      <h3 className="font-bold text-white text-base">{proj.title}</h3>
                      <p className="text-sm text-slate-300 mt-1">{proj.description || 'No description provided.'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tasks View & Status Change */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-lg font-bold mb-4 text-indigo-300 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-400 inline-block"></span>
              Tasks
            </h2>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-sm text-slate-400">No tasks assigned.</p>
              ) : (
                tasks.map((task) => {
                  const statusColors = getStatusColor(task.status);
                  return (
                    <div key={task.id} className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div>
                        <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                          {/* 🔴🟡🟢 Indicator Dot depende sa status */}
                          <span className={`h-2.5 w-2.5 rounded-full ${statusColors.bg} inline-block`}></span>
                          {task.title}
                        </h4>
                        <span className={`inline-flex items-center gap-1.5 mt-1 text-xs px-2 py-0.5 rounded bg-slate-900/80 ${statusColors.text} border ${statusColors.border} capitalize`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusColors.bg}`}></span>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>

                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="bg-slate-700 text-white text-xs p-2 rounded border border-slate-500 focus:outline-none focus:border-indigo-400 cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Developers Section (Lalabas lang para sa Admin / Project Manager) */}
          {isManagerOrAdmin && (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h2 className="text-lg font-bold mb-4 text-indigo-300 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400 inline-block"></span>
                Developers List
              </h2>
              <div className="space-y-3">
                {developers.length === 0 ? (
                  <p className="text-sm text-slate-400">No developers found.</p>
                ) : (
                  developers.map((dev) => (
                    <div key={dev.id} className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div>
                        <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-cyan-400 inline-block"></span>
                          {dev.name}
                        </h4>
                        <p className="text-xs text-slate-400 pl-4">{dev.email}</p>
                      </div>

                      <div className="space-x-2 flex items-center">
                        {/* 🟡 Action Button: Edit */}
                        <button
                          onClick={() => handleOpenEditModal(dev)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition flex items-center gap-1"
                        >
                          Edit
                        </button>
                        
                        {/* 🔴 Action Button: Delete */}
                        <button
                          onClick={() => handleDeleteDeveloper(dev.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs transition flex items-center gap-1"
                        >
                          <span></span>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 🟡 [BAGONG DAGDAG]: Modal UI Overlay para sa Editing ng Developer Details */}
      {editingDev && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-indigo-300 mb-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-400 inline-block"></span>
              Edit Developer ({editingDev.name})
            </h3>

            <form onSubmit={handleUpdateDeveloper} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Developer Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                 onChange={(e) => setEditEmail(e.target.value)}
                
                 className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Role</label>
                <input
                  type="role"
                  required
                  value={editRole}
                  disabled
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDev(null)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded transition flex items-center gap-1"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition flex items-center gap-1 font-semibold"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-200"></span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}