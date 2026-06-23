'use client';
import { useState } from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { supabase } from "@/supabase-client";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [psword, setPsword] = useState('');
  const [cpsword, setCpsword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (psword !== cpsword) {
        setError("Passwords do not match.");
        return;
      }
      if (psword.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (!/[0-9]/.test(psword)) {
        setError("Password must contain at least one number.");
        return;
      }
      if (!/[A-Z]/.test(psword)) {
        setError("Password must contain at least one uppercase letter.");
        return;
      }
      if (!/[a-z]/.test(psword)) {
        setError("Password must contain at least one lowercase letter.");
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(psword)) {
        setError("Password must contain at least one special character.");
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: psword,
        options: { data: { name } },
      });

      if (signUpError) {
        console.error("Error signing up:", signUpError.message);
        setError(signUpError.message);
        return;
      }

      if (signUpData.user) {
        const { error: usersError } = await supabase
          .from('users')
          .insert({
            id: signUpData.user.id,
            email: email,
            username: name,
          });

        if (usersError) {
          console.error("Error creating account:", usersError.message);
          setError(usersError.message);
          return;
        }
      }

      console.log("Signed up successfully!", { email, name });

    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: psword,
      });

      if (signInError) {
        console.error("Error signing in:", signInError.message);
        setError(signInError.message);
        return;
      }

      console.log("Signed in successfully!", { email });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-slate-800 rounded-lg shadow-md flex flex-col space-y-4"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>

        <Input
          label="Email Address"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {isSignUp && (
          <Input
            label="Username"
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <Input
          label="Password"
          type="password"
          placeholder="Password"
          value={psword}
          onChange={(e) => setPsword(e.target.value)}
          required
        />

        {isSignUp && (
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm Password"
            value={cpsword}
            onChange={(e) => setCpsword(e.target.value)}
            error={error.includes("match") ? error : undefined}
            required
          />
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button
          label={isSignUp ? "Sign Up" : "Sign In"}
          type="submit"
          size="md"
          scale="bounce"
          className="w-full mt-2"
        />
      </form>

      <Button
        label={isSignUp ? "Switch to Sign In" : "Switch to Sign Up"}
        type="button"
        size="sm"
        className="mt-4 underline text-slate-300"
        onClick={() => {
          setError('');
          setIsSignUp(!isSignUp);
        }}
      />
    </div>
  );
}