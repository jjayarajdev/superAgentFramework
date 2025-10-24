/**
 * User Profile Component
 * Displays current user info and allows logout
 */
import React, { useState, useEffect } from 'react';
import { getUser, authApi, logout } from './api';
import './UserProfile.css';

function UserProfile() {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(false);

  // Fetch fresh user data
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout(); // Clear local storage and redirect
    }
  };

  if (!user) return null;

  const getRoleBadgeClass = (role) => {
    const roleClasses = {
      admin: 'role-badge-admin',
      developer: 'role-badge-developer',
      operator: 'role-badge-operator',
      viewer: 'role-badge-viewer'
    };
    return roleClasses[role.toLowerCase()] || 'role-badge-default';
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: '👑',
      developer: '💻',
      operator: '⚙️',
      viewer: '👀'
    };
    return icons[role.toLowerCase()] || '👤';
  };

  return (
    <div className="user-profile-dropdown">
      <button className="profile-trigger">
        <div className="profile-avatar">
          {getRoleIcon(user.role)} {user.username || user.email}
        </div>
        <span className="dropdown-arrow">▼</span>
      </button>

      <div className="profile-menu">
        <div className="profile-header">
          <div className="profile-info">
            <h4>{user.full_name || user.username}</h4>
            <p>{user.email}</p>
            <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
              {getRoleIcon(user.role)} {user.role.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Organization:</span>
            <span className="detail-value">{user.org_id}</span>
          </div>
          {user.team_id && (
            <div className="detail-item">
              <span className="detail-label">Team:</span>
              <span className="detail-value">{user.team_id}</span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Permissions:</span>
            <span className="detail-value">
              {user.permissions ? user.permissions.length : 0} permissions
            </span>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={fetchProfile} disabled={loading} className="action-button">
            {loading ? 'Refreshing...' : '🔄 Refresh Profile'}
          </button>
          <button onClick={handleLogout} className="action-button logout-button">
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
