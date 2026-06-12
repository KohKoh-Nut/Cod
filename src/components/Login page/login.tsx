'use client';

import { useState } from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';

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
        <Input
          label="Email Address"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Username Input */}
        <Input
          label="Username"
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Password Input */}
        <Input
          label="Password"
          type="password"
          placeholder="Password"
          value={psword}
          onChange={(e) => setPsword(e.target.value)}
          required
        />

        {/* Confirm Password Input */}
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm Password"
          value={cpsword}
          onChange={(e) => setCpsword(e.target.value)}
          error={error.includes("match") ? error : undefined}
          required
        />

        {/* Submit Button */}
        <Button
          label="Sign Up"
          type="submit"
          size="md"
          scale="bounce"
          className="w-full mt-2"
        />
        
      </form>
    </div>
  );
}