"use client";

import type React from "react";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
	id: string;
	email: string;
	name: string;
}

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<boolean>;
	logout: () => void;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		// Check for stored auth token
		const token = localStorage.getItem("auth-token");
		if (token) {
			// Simulate user data - in real app, validate token with API
			setUser({
				id: "1",
				email: "user@example.com",
				name: "John Doe"
			});
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		if (!loading && !user && pathname !== "/login") {
			router.push("/login");
		}
	}, [user, loading, pathname, router]);

	const login = useCallback(async (email: string, password: string): Promise<boolean> => {
		// Simulate API call
		if (email === "admin@scalingo.com" && password === "password") {
			const userData = {
				id: "1",
				email,
				name: "Admin User"
			};
			setUser(userData);
			localStorage.setItem("auth-token", "mock-token");
			return true;
		}
		return false;
	}, []);

	const logout = useCallback(() => {
		setUser(null);
		localStorage.removeItem("auth-token");
		router.push("/login");
	}, [router]);

	const value = useMemo(() => ({ user, login, logout, loading }), [user, login, logout, loading]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
