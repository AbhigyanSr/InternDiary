import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import JobCard from '../components/jobCard';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetching jobs (Assume backend route /api/jobs returns last 24h jobs)
        const data = await apiRequest('/jobs', 'GET', null, token);
        setJobs(data);
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
      
      alert(`Tracked: Applied to ${job.company}`);
      
      // Optional: Filter out the job from the feed once applied
      setJobs(jobs.filter(j => j._id !== job._id));
    } catch (err) {
      console.error('Error tracking application:', err);
      alert("Error tracking application: " + err.message);
    }
  };

  if (loading) return <div className="text-center p-10">Searching for new openings...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Internship Feed</h1>
          <p className="text-gray-500">New opportunities posted in the last 24 hours.</p>
        </div>
        <div className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
          {jobs.length} Openings Found
        </div>
      </header>

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <JobCard 
              key={job._id} 
              job={job} 
              onApply={() => handleApply(job)} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border-2 border-dashed border-gray-200 text-center">
          <p className="text-gray-500">No new internships found in the last 24 hours. Check back later!</p>
        </div>
      )}
    </div>
  );
}