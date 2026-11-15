import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import DomainPreferences from '../components/DomainPreferences.jsx';
import { fileUrl, getMe, uploadRequest } from '../services/api.js';

export default function Profile() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(user?.resumePath || '');

  // The stored login data has no resumePath, so fetch it from the server.
  useEffect(() => {
    getMe(localStorage.getItem('token'))
      .then((me) => setResumeUrl(me.resumePath || ''))
      .catch((err) => console.error('Could not load profile', err));
  }, []);

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
      const data = await uploadRequest('/user/resume', formData, localStorage.getItem('token'));
      setResumeUrl(data.path);
      alert("Resume uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto card p-8">
      <h1 className="page-title mb-2">Your Profile</h1>
      <p className="text-muted mb-8">Manage your account and resume</p>
      
      <div className="mb-8">
        <label className="text-sm text-muted mb-1">Email Address</label>
        <p className="text-lg font-medium">{user?.email}</p>
      </div>

      <div className="divider"></div>
      <div className="my-8">
        <DomainPreferences /> </div>

      <section>
        <h2 className="section-title mb-4">Resume Management</h2>
        
        {resumeUrl ? (
          <div className="mb-6 alert alert-success flex items-center justify-between">
            <span className="font-medium">✓ Resume is uploaded</span>
            <a 
              href={fileUrl(resumeUrl)}
              target="_blank"
              rel="noopener noreferrer" 
              className="link-accent text-sm font-medium"
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