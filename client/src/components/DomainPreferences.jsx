import { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { TECH_DOMAINS } from '../constants/domains.js';

export default function DomainPreferences() {
  const { user, savePreferences } = useAuth();
  const [selected, setSelected] = useState(user?.preferredDomains || []);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const toggleDomain = (domain) => {
    setStatus('');
    setSelected((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus('');
    try {
      await savePreferences(selected);
      setStatus('Preferences saved');
    } catch (err) {
      setStatus(err.message || 'Could not save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Your domains</h2>
      <p className="text-muted text-sm mb-4">
        Your news feed will show articles from the domains you pick here.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {TECH_DOMAINS.map((domain) => {
          const isActive = selected.includes(domain);
          return (
            <button
              key={domain}
              type="button"
              onClick={() => toggleDomain(domain)}
              className={`chip ${isActive ? 'chip-success' : 'chip-neutral'}`}
              aria-pressed={isActive}
            >
              {domain}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save preferences'}
        </button>
        {status && <span className="text-sm text-muted">{status}</span>}
      </div>
    </div>
  );
}