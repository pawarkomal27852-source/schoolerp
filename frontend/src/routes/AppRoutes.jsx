import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Protection
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';

// Pages
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';

import Students from '../pages/students/Students';
import AddStudent from '../pages/students/AddStudent';
import EditStudent from '../pages/students/EditStudent';
import StudentDetails from '../pages/students/StudentDetails';

import Parents from '../pages/parents/Parents';
import Classes from '../pages/classes/Classes';

import Attendance from '../pages/attendance/Attendance';
import AttendanceHistory from '../pages/attendance/AttendanceHistory';

import Fees from '../pages/fees/Fees';
import FeeCollection from '../pages/fees/FeeCollection';
import PendingFees from '../pages/fees/PendingFees';
import FeeStructure from '../pages/fees/FeeStructure';

import Payments from '../pages/payments/Payments';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';
import Timetable from '../pages/timetable/Timetable';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes inside AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Students */}
        <Route path="/students" element={<Students />} />
        <Route path="/students/new" element={<AddStudent />} />
        <Route path="/students/:id" element={<StudentDetails />} />
        <Route path="/students/:id/edit" element={<EditStudent />} />

        {/* Parents */}
        <Route path="/parents" element={<Parents />} />

        {/* Classes */}
        <Route path="/classes" element={<Classes />} />

        {/* Timetable */}
        <Route path="/timetable" element={<Timetable />} />

        {/* Attendance */}
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/history" element={<AttendanceHistory />} />

        {/* Fees */}
        <Route path="/fees" element={<Fees />} />
        <Route path="/fees/collect" element={<FeeCollection />} />
        <Route path="/fees/pending" element={<PendingFees />} />
        <Route path="/fees/structure" element={<FeeStructure />} />

        {/* Payments */}
        <Route path="/payments" element={<Payments />} />

        {/* Reports */}
        <Route path="/reports" element={<Reports />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
