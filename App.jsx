import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/jobs";

const EMPTY_FORM = {
  company: "",
  position: "",
  status: "Applied",
  appliedDate: "",
  location: "",
  jobType: "Full Time",
  notes: "",
};

const STATUS_OPTIONS = ["All", "Applied", "Interview", "Offer", "Rejected"];

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Could not connect to the Spring Boot server.");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const keyword = search.toLowerCase().trim();

      const matchesSearch =
        !keyword ||
        job.company?.toLowerCase().includes(keyword) ||
        job.position?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" ||
        job.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const totalJobs = jobs.length;

  const appliedJobs = jobs.filter(
    (job) => job.status?.toLowerCase() === "applied"
  ).length;

  const interviewJobs = jobs.filter(
    (job) => job.status?.toLowerCase() === "interview"
  ).length;

  const offerJobs = jobs.filter(
    (job) => job.status?.toLowerCase() === "offer"
  ).length;

  const rejectedJobs = jobs.filter(
    (job) => job.status?.toLowerCase() === "rejected"
  ).length;

  const openAddModal = () => {
    setEditingJob(null);
    setForm({
      ...EMPTY_FORM,
      appliedDate: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);

    setForm({
      company: job.company || "",
      position: job.position || "",
      status: job.status || "Applied",
      appliedDate: job.appliedDate || "",
      location: job.location || "",
      jobType: job.jobType || "Full Time",
      notes: job.notes || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingJob(null);
    setForm(EMPTY_FORM);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.company.trim() || !form.position.trim()) {
      alert("Company and position are required.");
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(editingJob);

      const response = await fetch(
        isEditing ? `${API_URL}/${editingJob.id}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save job");
      }

      await fetchJobs();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving the application.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setJobs((previous) => previous.filter((job) => job.id !== id));

      if (selectedJob?.id === id) {
        setShowDetails(false);
        setSelectedJob(null);
      }
    } catch (err) {
      console.error(err);
      alert("Could not delete the application.");
    }
  };

  const openDetails = (job) => {
    setSelectedJob(job);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedJob(null);
    setShowDetails(false);
  };

  const getInitial = (company) => {
    return company?.charAt(0)?.toUpperCase() || "?";
  };

  const getStatusClass = (status) => {
    const normalized = status?.toLowerCase();

    if (normalized === "applied") return "status-applied";
    if (normalized === "interview") return "status-interview";
    if (normalized === "offer") return "status-offer";
    if (normalized === "rejected") return "status-rejected";

    return "status-default";
  };

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">J</div>

          <div>
            <h1>JobTracker</h1>
            <span>Career Dashboard</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="nav-item active">
            <span>⌂</span>
            Dashboard
          </a>

          <a href="#applications" className="nav-item">
            <span>▣</span>
            Applications
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="tip-card">
            <div className="tip-icon">✦</div>
            <div>
              <strong>Stay organized</strong>
              <p>Keep every application and update in one place.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">JOB APPLICATIONS</p>
            <h2>Dashboard</h2>
          </div>

          <button className="add-button" onClick={openAddModal}>
            <span>+</span>
            Add Application
          </button>
        </header>

        <main className="content" id="dashboard">
          {/* WELCOME */}
          <section className="welcome">
            <div>
              <h2>Track your career journey.</h2>
              <p>
                Keep your job applications organized and know exactly where
                you stand.
              </p>
            </div>

            <div className="welcome-decoration">
              <div className="circle circle-one"></div>
              <div className="circle circle-two"></div>
              <div className="briefcase">💼</div>
            </div>
          </section>

          {/* STATS */}
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">▣</div>
              <div>
                <span>Total Applications</span>
                <strong>{totalJobs}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">◷</div>
              <div>
                <span>Applied</span>
                <strong>{appliedJobs}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">★</div>
              <div>
                <span>Interviews</span>
                <strong>{interviewJobs}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">✓</div>
              <div>
                <span>Offers</span>
                <strong>{offerJobs}</strong>
              </div>
            </div>

            <div className="stat-card rejected-stat">
              <div className="stat-icon red">×</div>
              <div>
                <span>Rejected</span>
                <strong>{rejectedJobs}</strong>
              </div>
            </div>
          </section>

          {/* APPLICATIONS */}
          <section className="applications-section" id="applications">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR WORKSPACE</p>
                <h2>My Applications</h2>
                <p>Manage and monitor all your applications.</p>
              </div>

              <div className="result-count">
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1 ? "application" : "applications"}
              </div>
            </div>

            {/* SEARCH */}
            <div className="toolbar">
              <div className="search-box">
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="Search company or position..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="filters">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    className={`filter-button ${
                      statusFilter === status ? "selected" : ""
                    }`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="state-card error-state">
                <div className="state-icon">!</div>
                <h3>Connection problem</h3>
                <p>{error}</p>
                <button onClick={fetchJobs}>Try Again</button>
              </div>
            )}

            {/* LOADING */}
            {loading && !error && (
              <div className="state-card">
                <div className="loader"></div>
                <h3>Loading applications...</h3>
                <p>Getting your latest applications.</p>
              </div>
            )}

            {/* EMPTY */}
            {!loading && !error && filteredJobs.length === 0 && (
              <div className="state-card">
                <div className="empty-icon">▣</div>

                <h3>
                  {jobs.length === 0
                    ? "No applications yet"
                    : "No matching applications"}
                </h3>

                <p>
                  {jobs.length === 0
                    ? "Start building your application tracker by adding your first job."
                    : "Try changing your search or status filter."}
                </p>

                {jobs.length === 0 && (
                  <button onClick={openAddModal}>Add Your First Job</button>
                )}
              </div>
            )}

            {/* JOB GRID */}
            {!loading && !error && filteredJobs.length > 0 && (
              <div className="jobs-grid">
                {filteredJobs.map((job) => (
                  <article className="job-card" key={job.id}>
                    <div className="job-card-header">
                      <div className="company-logo">
                        {getInitial(job.company)}
                      </div>

                      <span
                        className={`status-badge ${getStatusClass(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div className="job-main">
                      <h3>{job.position}</h3>
                      <p className="company-name">{job.company}</p>
                    </div>

                    <div className="job-info">
                      <span>
                        <b>⌖</b>
                        {job.location || "Not specified"}
                      </span>

                      <span>
                        <b>▤</b>
                        {job.jobType || "Not specified"}
                      </span>
                    </div>

                    <div className="job-date">
                      <span>Applied</span>
                      <strong>{job.appliedDate || "—"}</strong>
                    </div>

                    <div className="card-actions">
                      <button
                        className="view-button"
                        onClick={() => openDetails(job)}
                      >
                        View Details
                      </button>

                      <button
                        className="icon-button"
                        title="Edit"
                        onClick={() => openEditModal(job)}
                      >
                        ✎
                      </button>

                      <button
                        className="icon-button delete-button"
                        title="Delete"
                        onClick={() => handleDelete(job.id)}
                      >
                        ♲
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay" onMouseDown={closeModal}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {editingJob ? "UPDATE APPLICATION" : "NEW APPLICATION"}
                </p>

                <h2>
                  {editingJob ? "Edit Application" : "Add Application"}
                </h2>
              </div>

              <button className="close-button" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Company *</label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleInputChange}
                    placeholder="e.g. Google"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Position *</label>
                  <input
                    name="position"
                    value={form.position}
                    onChange={handleInputChange}
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                  >
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Applied Date</label>
                  <input
                    type="date"
                    name="appliedDate"
                    value={form.appliedDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Bangalore"
                  />
                </div>

                <div className="form-group">
                  <label>Job Type</label>
                  <select
                    name="jobType"
                    value={form.jobType}
                    onChange={handleInputChange}
                  >
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Internship</option>
                    <option>Contract</option>
                    <option>Remote</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleInputChange}
                    placeholder="Add notes about this application..."
                    rows="4"
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingJob
                    ? "Save Changes"
                    : "Add Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetails && selectedJob && (
        <div className="modal-overlay" onMouseDown={closeDetails}>
          <div
            className="details-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="details-top">
              <div className="company-logo large">
                {getInitial(selectedJob.company)}
              </div>

              <button className="close-button" onClick={closeDetails}>
                ×
              </button>
            </div>

            <span
              className={`status-badge ${getStatusClass(
                selectedJob.status
              )}`}
            >
              {selectedJob.status}
            </span>

            <h2>{selectedJob.position}</h2>
            <p className="details-company">{selectedJob.company}</p>

            <div className="details-grid">
              <div>
                <span>Location</span>
                <strong>{selectedJob.location || "Not specified"}</strong>
              </div>

              <div>
                <span>Job Type</span>
                <strong>{selectedJob.jobType || "Not specified"}</strong>
              </div>

              <div>
                <span>Applied Date</span>
                <strong>{selectedJob.appliedDate || "Not specified"}</strong>
              </div>

              <div>
                <span>Application ID</span>
                <strong>#{selectedJob.id}</strong>
              </div>
            </div>

            <div className="notes-section">
              <span>Notes</span>
              <p>{selectedJob.notes || "No notes added for this application."}</p>
            </div>

            <div className="details-actions">
              <button
                className="cancel-button"
                onClick={() => {
                  closeDetails();
                  openEditModal(selectedJob);
                }}
              >
                Edit Application
              </button>

              <button
                className="delete-full-button"
                onClick={() => handleDelete(selectedJob.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;