// src/components/SignInPage.js
import React, { useState } from "react";
import { signIn, confirmSignUp, signOut, fetchUserAttributes, resendSignUpCode } from "@aws-amplify/auth";
import "./AuthPages.css";

export default function SignInPage({ onLoginSuccess, onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needConfirm, setNeedConfirm] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const user = await signIn({ username: email, password });
      console.log('Sign in successful:', user);
      
      // Check if email is verified
      try {
        const attributes = await fetchUserAttributes();
        if (attributes.email_verified !== 'true') {
          await signOut();
          setNeedConfirm(true);
          setMessage("Your email is not verified. Please enter the verification code sent to your email.");
          return;
        }
      } catch (attrErr) {
        console.error("Fetch attributes error:", attrErr);
        await signOut();
        setNeedConfirm(true);
        setMessage("Your email is not verified. Please enter the verification code sent to your email.");
        return;
      }
      
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      console.error("Sign-in error:", err);
      if (err && (err.name === "UserNotConfirmedException" || err.code === "UserNotConfirmedException")) {
        setNeedConfirm(true);
        setMessage("Your account is not confirmed. Please enter the verification code sent to your email.");
      } else {
        setMessage(err.message || "Sign in failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setMessage("Please enter the verification code.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      console.log('Confirming signup with code:', code);
      await confirmSignUp({ username: email, confirmationCode: code });
      setMessage("Account confirmed successfully! Signing you in...");
      // After confirming, try sign in automatically
      const user = await signIn({ username: email, password });
      console.log('Auto sign-in after confirmation successful:', user);
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      console.error("Confirm error:", err);
      if (err.name === "CodeMismatchException" || err.code === "CodeMismatchException") {
        setMessage("Invalid verification code. Please check and try again.");
      } else if (err.name === "ExpiredCodeException" || err.code === "ExpiredCodeException") {
        setMessage("Verification code has expired. Please request a new one.");
      } else {
        setMessage(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage("");
    try {
      await resendSignUpCode({ username: email });
      setMessage("A new verification code has been sent to your email.");
    } catch (err) {
      console.error("Resend error:", err);
      setMessage(err.message || "Could not resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
    <header className="auth-header">
  <div className="auth-symbol" aria-hidden="true">📘</div>
  <div>
    <h1>Welcome to <span className="brand-highlight">TANCET Prep</span></h1>
    <p className="lead">Practice smart • Score better • Track progress.</p>
  </div>
</header>


      <div className="auth-card-wrapper">
        {!needConfirm ? (
          <form className="auth-form" onSubmit={handleSignIn}>
            <h2>Sign In</h2>

            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

            <label>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

            <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>

            {message && <p className="error-text">{message}</p>}

            <p className="switch-text">
              Don't have an account? <span className="link" onClick={onSwitchToSignUp}>Sign up</span>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleConfirm}>
            <h2>Confirm your account</h2>
            <p className="small">We sent a confirmation code to <strong>{email}</strong>.</p>

            <label>Confirmation Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} required />

            <button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify & Sign In"}</button>

            {message && <p className="error-text">{message}</p>}

            <p className="switch-text">
              <span className="link" onClick={handleResend}>Resend code</span> | <span className="link" onClick={() => setNeedConfirm(false)}>Back to sign in</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
