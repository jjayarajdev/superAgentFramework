/**
 * PrivateRoute Component
 * Protects routes that require authentication
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './api';

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
