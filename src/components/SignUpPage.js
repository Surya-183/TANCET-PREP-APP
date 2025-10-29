// src/components/SignUpPage.js
import React, { useState } from "react";
import { signUp, confirmSignUp, resendSignUpCode } from "@aws-amplify/auth";
import "./AuthPages.css";

export default function SignUpPage({ onSwitchToSignIn }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState("form"); // 'form' | 'confirm' | 'done'
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: { name, email },
        },
      });
      setPhase("confirm");
      setMessage("Confirmation code sent to your email. Please enter it below.");
    } catch (err) {
      console.error("Sign-up error:", err);
      setMessage(err.message || "Could not sign up. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code
      });
      setPhase("done");
      setMessage("Account confirmed! You can now sign in.");
    } catch (err) {
      console.error("Confirm error:", err);
      setMessage(err.message || "Could not confirm. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage("");
    try {
      await resendSignUpCode({ username: email });
      setMessage("A fresh confirmation code was sent to your email.");
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
        {phase === "form" && (
          <form className="auth-form" onSubmit={handleSignUp}>
            <h2>Create Account</h2>

            <label>Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />

            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <button type="submit" disabled={loading}>{loading ? "Creating..." : "Sign Up"}</button>

            {message && <p className="info-text">{message}</p>}

            <p className="switch-text">
              Already have an account? <span className="link" onClick={onSwitchToSignIn}>Sign in</span>
            </p>
          </form>
        )}

        {phase === "confirm" && (
          <form className="auth-form" onSubmit={handleConfirm}>
            <h2>Confirm your account</h2>
            <p className="small">A confirmation code was sent to <strong>{email}</strong>.</p>

            <label>Confirmation Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} required />

            <button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify account"}</button>

            <div className="confirm-actions">
              <button type="button" className="link-btn" onClick={handleResend} disabled={loading}>Resend code</button>
              <button type="button" className="link-btn" onClick={() => setPhase("form")}>Edit details</button>
            </div>

            {message && <p className="info-text">{message}</p>}
          </form>
        )}

        {phase === "done" && (
          <div className="auth-form">
            <h2>Account confirmed</h2>
            <p className="info-text">You can now sign in with your email and password.</p>
            <button onClick={onSwitchToSignIn}>Go to Sign In</button>
          </div>
        )}
      </div>
    </div>
  );
}
