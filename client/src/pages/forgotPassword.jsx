import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resetPassword, verifyOTP, resetNewPassword } from '../services/api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email', 'otp', or 'password'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await resetPassword(email);
      setSuccess('OTP sent to your registered email');
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP(email, otp);
      setResetToken(response.resetToken);
      setSuccess('OTP verified successfully');
      setStep('password');
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await resetNewPassword(resetToken, newPassword);
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
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
            {step === 'email' && 'Reset your password'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'password' && 'Set new password'}
          </h2>
          <p className="text-muted text-sm mt-1">
            {step === 'email' && 'Enter your registered email address'}
            {step === 'otp' && 'Enter the OTP sent to your email'}
            {step === 'password' && 'Create your new password'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {step === 'email' && (
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
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form className="space-y-4" onSubmit={handleOTPSubmit}>
            <div>
              <label htmlFor="email-display">Email</label>
              <input
                id="email-display"
                type="email"
                disabled
                className="field bg-gray-100"
                value={email}
              />
            </div>

            <div>
              <label htmlFor="otp">Enter OTP (6 digits)</label>
              <input
                id="otp"
                type="text"
                required
                maxLength="6"
                className="field"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
              <p className="text-muted text-xs mt-1">OTP expires in 10 minutes</p>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
                setError('');
              }}
              className="btn-secondary w-full py-3"
              disabled={loading}
            >
              Back
            </button>
          </form>
        )}

        {step === 'password' && (
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
                setStep('otp');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
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
      </div>
    </div>
  );
}
