"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../../src/services/authService';
import { validators } from '../../src/utils/validators';

export default function LoginPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [generalError, setGeneralError] = useState('');
	const [success, setSuccess] = useState('');

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.email) {
			newErrors.email = 'Email is required';
		} else if (!validators.email(formData.email)) {
			newErrors.email = 'Please enter a valid email address';
		}

		if (!formData.password) {
			newErrors.password = 'Password is required';
		} else if (formData.password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: '',
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setGeneralError('');
		setSuccess('');

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		try {
			const response = await authService.login({
				email: formData.email,
				password: formData.password,
			});

			if (response.token) {
				authService.setToken(response.token);
				setSuccess('Login successful! Redirecting to dashboard...');
				setTimeout(() => {
					router.push('/dashboard');
				}, 1500);
			}
		} catch (error: any) {
			setGeneralError(error.message || 'Login failed. Please check your credentials.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
						<p className="text-slate-400">Login to your MomentVibe account</p>
					</div>

					{generalError && (
						<div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
							{generalError}
						</div>
					)}

					{success && (
						<div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
							{success}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
								Email Address
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="Enter your email"
								className={`w-full px-4 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors ${
									errors.email ? 'border-red-500/50' : 'border-slate-600/50'
								}`}
							/>
							{errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
								Password
							</label>
							<input
								type="password"
								id="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="Enter your password"
								className={`w-full px-4 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors ${
									errors.password ? 'border-red-500/50' : 'border-slate-600/50'
								}`}
							/>
							{errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
						</div>

						<div className="text-right">
							<Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
								Forgot password?
							</Link>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all mt-6"
						>
							{isLoading ? 'Logging in...' : 'Login'}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-slate-400 text-sm">
							Don't have an account?{' '}
							<Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold">
								Register here
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
