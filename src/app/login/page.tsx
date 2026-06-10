'use client';

import { useState } from 'react';

export default function SignupForm() {

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [psword, setPsword] = useState('');
  const [cpsword, setCpsword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Check 1: Do the passwords match?
    if (psword !== cpsword) {
        setError("Passwords do not match.");
        return;
    }

    // Check 2: Is it long enough?
    if (psword.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
    }

    // Check 3: Does it have a number?
    if (!/[0-9]/.test(psword)) {
        setError("Password must contain at least one number.");
        return;
    }

    // Check 4: Does it have an uppercase letter?
    if (!/[A-Z]/.test(psword)) {
        setError("Password must contain at least one uppercase letter.");
        return;
    }

    // Check 5: Does it have a lowercase letter?
    if (!/[a-z]/ .test(psword)) {
        setError("Password must contain at least one lowercase letter.");
        return;
    }

    // Check 6: Does it have a special character?
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(psword)) {
        setError("Password must contain at least one special character.");
        return;
    }

    console.log("Form submitted successfully!", { email, name, psword });
    // This is where you would call your API backend route

  };

  return (
    // The Layout Blueprint (Centered Wrapper)
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      
      {/* Form Architecture & Layout Container */}
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md p-6 bg-slate-800 rounded-lg shadow-md flex flex-col space-y-4"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-2">Create Account</h2>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded focus:outline-none focus:border-cyan-500"
          required
        />

        {/* Username Input */}
        <input
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded focus:outline-none focus:border-cyan-500"
          required
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          value={psword}
          onChange={(e) => setPsword(e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded focus:outline-none focus:border-cyan-500"
          required
        />

        {/* Confirm Password Input */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={cpsword}
          onChange={(e) => setCpsword(e.target.value)}
          className="bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded focus:outline-none focus:border-cyan-500"
          required
        />

        {/* Conditional Error Message Column */}
        {error && (
        <div className="flex items-center space-x-2 text-red-400 text-sm font-medium animate-fade-in">
            <span className="text-base font-bold">✕</span>
            <span>{error}</span>
        </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded transition colors"
        >
          Sign Up
        </button>
        
      </form>
    </div>
  );
}