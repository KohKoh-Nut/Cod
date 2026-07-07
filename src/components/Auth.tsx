"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Input from "@/components/Input";
import Button from "@/components/Button";
import { supabase } from "@/utils/supabase-client";

export default function Auth() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const validatePassword = (): string | null => {
        if (password !== confirmPassword) return "Passwords do not match.";
        if (password.length < 8)
            return "Password must be at least 8 characters long.";
        if (!/[0-9]/.test(password))
            return "Password must contain at least one number.";
        if (!/[A-Z]/.test(password))
            return "Password must contain at least one uppercase letter.";
        if (!/[a-z]/.test(password))
            return "Password must contain at least one lowercase letter.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
            return "Password must contain at least one special character.";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (isSignUp) {
            const validationError = validatePassword();
            if (validationError) {
                setError(validationError);
                return;
            }

            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name: username } },
            });

            if (signUpError) {
                console.error("Error signing up:", signUpError.message);
                setError(signUpError.message);
                return;
            }

            setSuccess("Account created! Check your email to confirm.");
            console.log("Signed up successfully!", { email, username });

        } else {
            const { error: signInError } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

            if (signInError) {
                console.error("Error signing in:", signInError.message);
                setError(signInError.message);
                return;
            }

            console.log("Signed in successfully!", { email });
            router.push("/");
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-bg p-4 rounded-none">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md p-6 bg-bg-surface border border-border flex flex-col space-y-4 rounded-none"
            >
                <h2 className="text-2xl font-bold text-fg text-center mb-2 font-mono">
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
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                )}

                <Input
                    label="Password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {isSignUp && (
                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={error.includes("match") ? error : undefined}
                        required
                    />
                )}

                {error && (
                    <p className="text-sm text-error font-mono">{error}</p>
                )}

                {success && (
                    <p className="text-sm text-success font-mono">{success}</p>
                )}

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
                className="mt-4 underline text-fg-muted"
                onClick={() => {
                    setError("");
                    setSuccess("");
                    setIsSignUp(!isSignUp);
                }}
            />
        </div>
    );
}