export default function JobCard({ job, onApply, isApplied }) {
  return (
    <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{job.title || job.role}</h3>
          <p className="text-gray-600 font-medium">{job.company}</p>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
          Due: {new Date(job.deadline).toLocaleDateString()}
        </span>
      </div>
      
      <div className="mt-4 flex gap-3">
        <a 
          href={job.applyLink} 
          target="_blank" 
          className="text-sm bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          View Posting
        </a>
        {!isApplied && (
          <button 
            onClick={() => onApply(job)}
            className="text-sm border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50"
          >
            Mark Applied
          </button>
        )}
      </div>
    </div>
  );
}