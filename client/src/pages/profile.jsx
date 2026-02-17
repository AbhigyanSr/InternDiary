import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h1>
      
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-500">Email Address</label>
        <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
      </div>

      <hr className="my-6 border-gray-100" />

      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-4">Resume Management</h2>
        
        {resumeUrl ? (
          <div className="mb-4 p-4 bg-green-50 rounded-lg flex items-center justify-between">
            <span className="text-green-700 text-sm font-medium">✓ Resume is uploaded</span>
            <a 
              href={`http://localhost:5000/${resumeUrl}`} 
              target="_blank" 
              className="text-indigo-600 hover:underline text-sm"
            >
              View Current PDF
            </a>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No resume uploaded yet. Upload a PDF to complete your profile.</p>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <button 
            type="submit" 
            disabled={uploading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition ${
              uploading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Update Resume'}
          </button>
        </form>
      </section>
    </div>
  );
}