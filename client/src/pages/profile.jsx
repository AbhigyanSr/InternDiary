import { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import DomainPreferences from '../components/DomainPreferences.jsx';

export default function Profile() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(user?.resumePath || '');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first");

    const formData = new FormData();
    formData.append('resume', file); // 'resume' matches upload.single('resume') on backend

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Don't set Content-Type header when sending FormData; 
          // the browser sets it automatically with the boundary string.
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResumeUrl(data.path);
        alert("Resume uploaded successfully!");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto card p-8">
      <h1 className="text-3xl font-semibold mb-2">Your Profile</h1>
      <p className="text-muted mb-8">Manage your account and resume</p>
      
      <div className="mb-8">
        <label className="text-sm text-muted mb-1">Email Address</label>
        <p className="text-lg font-medium">{user?.email}</p>
      </div>

      <div className="divider"></div>
      <div className="my-8">
        <DomainPreferences /> </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Resume Management</h2>
        
        {resumeUrl ? (
          <div className="mb-6 p-4 bg-green-900/10 border border-green-900/30 rounded-lg flex items-center justify-between">
            <span className="text-green-400 text-sm font-medium">✓ Resume is uploaded</span>
            <a 
              href={`http://localhost:5000/${resumeUrl}`} 
              target="_blank"
              rel="noopener noreferrer" 
              className="text-accent hover:text-accent-hover text-sm font-medium"
            >
              View Current PDF →
            </a>
          </div>
        ) : (
          <p className="text-sm text-muted mb-6">No resume uploaded yet. Upload a PDF to complete your profile.</p>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="mb-2">Upload New Resume (PDF)</label>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              className="block w-full text-sm text-muted
                file:mr-4 file:py-2 file:px-4 
                file:rounded-md file:border-0 
                file:text-sm file:font-semibold 
                file:bg-accent/10 file:text-accent 
                hover:file:bg-accent/20 file:cursor-pointer
                file:transition"
            />
          </div>
          <button 
            type="submit" 
            disabled={uploading}
            className="btn-primary w-full py-3"
          >
            {uploading ? 'Uploading...' : 'Update Resume'}
          </button>
        </form>
      </section>
    </div>
  );
}