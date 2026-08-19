import { useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Navigate } from "react-router-dom";

import { auth } from "../../config/firebase";

interface ProtectedRouteProps {
	children: ReactNode;
}

export default function ProtectedRoute({
	children,
}: ProtectedRouteProps) {
	const [user, setUser] = useState<User | null>(null);
	const [authReady, setAuthReady] = useState(false);

	useEffect(() => {
		return onAuthStateChanged(auth, (nextUser) => {
			setUser(nextUser);
			setAuthReady(true);
		});
	}, []);

	if (!authReady) {
		return <div>Checking authentication...</div>;
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return children;
}
