import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email' or 'reset'
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await resetPassword(email);
      setResetToken(response.resetToken);
      setStep('reset');
    } catch (err) {
      alert(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + '/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resetToken,
          newPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reset password');
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      alert(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gradient mb-2">Intern Diary</h1>
          <h2 className="text-xl font-semibold">
            {step === 'email' ? 'Reset your password' : 'Enter new password'}
          </h2>
          <p className="text-muted text-sm mt-1">
            {step === 'email' 
              ? 'Enter your email to receive a reset link' 
              : 'Set your new password'}
          </p>
        </div>

        {submitted ? (
          <div className="bg-success-light border border-success rounded-lg p-4 text-center">
            <p className="text-success font-medium mb-4">
              Password reset successful!
            </p>
            <p className="text-muted text-sm mb-6">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            {step === 'email' ? (
              <form className="space-y-4" onSubmit={handleEmailSubmit}>
                <div>
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="field"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-3"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Get Reset Link'}
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handlePasswordReset}>
                <div>
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    className="field"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    className="field"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-3"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setResetToken('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="btn-secondary w-full py-3"
                  disabled={loading}
                >
                  Back
                </button>
              </form>
            )}

            <div className="divider"></div>

            <div className="text-center">
              <p className="text-muted text-sm">
                Remember your password?{' '}
                <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
