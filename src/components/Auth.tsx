"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { supabase } from "@/utils/supabase-client";

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

export default function Auth() {
    const router = useRouter();
    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const hash = window.location.hash;

            if (hash.includes('type=recovery')) {
                setMode('reset');
                window.history.replaceState(null, '', window.location.pathname);
                return;
            }

        const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setMode('reset');
                window.history.replaceState(null, '', window.location.pathname);
            }
        });

        return () => authListener.subscription.unsubscribe();
    }, []);

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    const validatePassword = (): string | null => {

        if (password !== confirmPassword) 
            return "Passwords do not match.";
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

    const handleSignIn = async () => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) { setError(error.message); 
                return; 
            }
            router.push('/');
        };

    const handleSignUp = async () => {
        const validationError = validatePassword();

            if (validationError) { setError(validationError); 
                return; 
            }

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name: username } },
            });

            if (error) { setError(error.message); 
                return; 
            }
            setSuccess("Account created! Check your email to confirm.");
    };

    const handleForgotPassword = async () => {

        if (!email) { setError("Please enter your email address.");
            return; 
        }

        const isDev = window.location.hostname === 'localhost';
        const redirectTo = isDev
            ? 'http://localhost:3000/Cod/login'
            : 'https://kohkoh-nut.github.io/Cod/login';

        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

        if (error) { setError(error.message); 
            return; 
        }
        setSuccess("Password reset link sent! Check your email.");
    };

    const handleResetPassword = async () => {
        const validationError = validatePassword();
        
        if (validationError) { setError(validationError); 
            return; 
        }

        const { error } = await supabase.auth.updateUser({ password });
        if (error) { setError(error.message); 
            return; 
        }
        setSuccess("Password updated successfully!");
        setTimeout(() => {
            setMode('signin');
            setPassword('');
            setConfirmPassword('');
            clearMessages();
        }, 2000);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearMessages();
        if (mode === 'signin') await handleSignIn();
        else if (mode === 'signup') await handleSignUp();
        else if (mode === 'forgot') await handleForgotPassword();
        else if (mode === 'reset') await handleResetPassword();
    };

    const titles: Record<AuthMode, string> = {
        signin: 'Sign In',
        signup: 'Create Account',
        forgot: 'Forgot Password',
        reset: 'Reset Password',
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-bg p-4 rounded-none">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md p-6 bg-bg-surface border border-border flex flex-col space-y-4 rounded-none"
            >
                <h2 className="text-2xl font-bold text-fg text-center mb-2 font-mono">
                    {titles[mode]}
                </h2>

                {mode !== 'reset' && (
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                )}

                {mode === 'signup' && (
                    <Input
                        label="Username"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                )}

                {(mode === 'signin' || mode === 'signup' || mode === 'reset') && (
                    <Input
                        label={mode === 'reset' ? "New Password" : "Password"}
                        type="password"
                        placeholder={mode === 'reset' ? "New Password" : "Password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                )}

                {(mode === 'signup' || mode === 'reset') && (
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

                {error && <p className="text-sm text-error font-mono">{error}</p>}
                {success && <p className="text-sm text-success font-mono">{success}</p>}

                <Button
                    label={
                        mode === 'signin' ? 'Sign In' :
                        mode === 'signup' ? 'Sign Up' :
                        mode === 'forgot' ? 'Send Reset Link' :
                        'Reset Password'
                    }
                    type="submit"
                    size="md"
                    scale="bounce"
                    className="w-full mt-2"
                />
            </form>

            <div className="flex flex-col items-center gap-2 mt-4">
                {mode === 'signin' && (
                    <>
                        <Button
                            label="Switch to Sign Up"
                            type="button"
                            size="sm"
                            className="underline text-fg-muted"
                            onClick={() => { clearMessages(); setMode('signup'); }}
                        />
                        <Button
                            label="Forgot password?"
                            type="button"
                            size="sm"
                            className="underline text-fg-muted"
                            onClick={() => { clearMessages(); setMode('forgot'); }}
                        />
                    </>
                )}

                {mode === 'signup' && (
                    <Button
                        label="Switch to Sign In"
                        type="button"
                        size="sm"
                        className="underline text-fg-muted"
                        onClick={() => { clearMessages(); setMode('signin'); }}
                    />
                )}

                {(mode === 'forgot' || mode === 'reset') && (
                    <Button
                        label="Back to Sign In"
                        type="button"
                        size="sm"
                        className="underline text-fg-muted"
                        onClick={() => { clearMessages(); setMode('signin'); }}
                    />
                )}
            </div>
        </div>
    );
}