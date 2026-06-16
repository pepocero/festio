import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewInvitationPage } from './pages/NewInvitationPage';
import { EditorPage } from './pages/EditorPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();
	if (loading) return <div className="loading-screen">Cargando...</div>;
	if (!user) return <Navigate to="/login" replace />;
	return children;
}

function GuestRoute({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();
	if (loading) return <div className="loading-screen">Cargando...</div>;
	if (user) return <Navigate to="/app" replace />;
	return children;
}

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/app" replace />} />
			<Route
				path="/login"
				element={
					<GuestRoute>
						<LoginPage />
					</GuestRoute>
				}
			/>
			<Route
				path="/register"
				element={
					<GuestRoute>
						<RegisterPage />
					</GuestRoute>
				}
			/>
			<Route
				path="/app"
				element={
					<ProtectedRoute>
						<DashboardPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/app/new"
				element={
					<ProtectedRoute>
						<NewInvitationPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/app/edit/:id"
				element={
					<ProtectedRoute>
						<EditorPage />
					</ProtectedRoute>
				}
			/>
			<Route path="*" element={<Navigate to="/app" replace />} />
		</Routes>
	);
}
