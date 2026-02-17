import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api.js';
import JobCard from '../components/jobCard.jsx';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetching jobs (Assume backend route /api/jobs returns last 24h jobs)
        const [jobsData, appsData] = await Promise.all([
          apiRequest('/jobs', 'GET', null, token),
          apiRequest('/applications', 'GET', null, token)
        ]);
        setJobs(jobsData);
        const appliedSet = new Set(
          (appsData || [])
            .map(app => app?.opportunity)
            .filter(Boolean)
        );
        setAppliedIds(appliedSet);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (job) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Applying to job:', job);

      if (!job?._id) {
        alert('Cannot apply: missing opportunity id');
        return;
      }
      
      const payload = {
        company: job.company,
        role: job.title || job.role, // Use title if available, fallback to role
        status: 'applied',
        opportunity: job._id
      };
      console.log('Application payload:', payload);

      // This sends the job details to our Application model in the backend
      await apiRequest('/applications', 'POST', payload, token);
      
      setAppliedIds(prev => new Set(prev).add(job._id));
      alert(`Tracked: Applied to ${job.company}`);
    } catch (err) {
      console.error('Error tracking application:', err);
      alert("Error tracking application: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-10">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-muted">Searching for new openings...</p>
      </div>
    );
  }

  const filteredJobs = filterType === 'All' 
    ? jobs 
    : jobs.filter(job => (job.type || 'Internship') === filterType);

  // Separate active and missed opportunities
  const now = new Date();
  const activeJobs = filteredJobs.filter(job => new Date(job.deadline) >= now);
  const missedJobs = filteredJobs.filter(job => 
    new Date(job.deadline) < now && !appliedIds.has(job._id)
  );

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Opportunity Feed</h1>
            <p className="text-muted">New opportunities posted in the last 24 hours</p>
          </div>
          <div className="chip">
            {activeJobs.length} Active {activeJobs.length === 1 ? 'Opportunity' : 'Opportunities'}
          </div>
        </div>
        
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted font-medium">Filter:</span>
          <button
            onClick={() => setFilterType('All')}
            className={`chip cursor-pointer transition ${filterType === 'All' ? '' : 'chip-neutral opacity-60 hover:opacity-100'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('Internship')}
            className={`chip cursor-pointer transition ${filterType === 'Internship' ? '' : 'chip-neutral opacity-60 hover:opacity-100'}`}
          >
            Internships
          </button>
          <button
            onClick={() => setFilterType('Hackathon')}
            className={`chip chip-warning cursor-pointer transition ${filterType === 'Hackathon' ? '' : 'chip-neutral opacity-60 hover:opacity-100'}`}
          >
            Hackathons
          </button>
          <button
            onClick={() => setFilterType('Webinar')}
            className={`chip chip-success cursor-pointer transition ${filterType === 'Webinar' ? '' : 'chip-neutral opacity-60 hover:opacity-100'}`}
          >
            Webinars
          </button>
        </div>
      </header>

      {/* Active Opportunities */}
      {activeJobs.length > 0 ? (
        <div className="dashboard-grid">
          {activeJobs.map(job => (
            <JobCard 
              key={job._id} 
              job={job} 
              onApply={() => handleApply(job)} 
              isApplied={appliedIds.has(job._id)}
            />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center" style={{ borderStyle: 'dashed' }}>
          <p className="text-muted">
            {jobs.length === 0 
              ? 'No new opportunities found in the last 24 hours. Check back later!' 
              : `No active ${filterType === 'All' ? 'opportunities' : filterType.toLowerCase() + 's'} found. Try a different filter.`}
          </p>
        </div>
      )}

      {/* Missed Opportunities Section */}
      {missedJobs.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border-subtle"></div>
            <h2 className="text-xl font-semibold text-muted">Missed Opportunities</h2>
            <div className="flex-1 h-px bg-border-subtle"></div>
          </div>
          <p className="text-sm text-muted text-center mb-6">
            These opportunities have passed their deadline and you didn't apply. Review them for future reference.
          </p>
          <div className="dashboard-grid opacity-60">
            {missedJobs.map(job => (
              <div key={job._id} className="relative">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] z-10 rounded-xl flex items-center justify-center">
                  <span className="chip chip-danger text-xs font-semibold">Deadline Passed</span>
                </div>
                <JobCard 
                  job={job} 
                  onApply={() => handleApply(job)} 
                  isApplied={appliedIds.has(job._id)}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

