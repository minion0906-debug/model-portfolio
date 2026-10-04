import Link from "next/link";

export default function Login() {
  return (
    <main className="auth">
      <div className="authCard">
        <Link className="logo" href="/">MAYA<span>.</span></Link>
        <p className="eyebrow dark">PRIVATE DASHBOARD</p>
        <h1>Welcome back.</h1>
        <p className="muted">Manage photos, videos, profile information and booking inquiries.</p>
        <form className="form">
          <label>Email<input type="email" placeholder="you@example.com" /></label>
          <label>Password<input type="password" placeholder="••••••••" /></label>
          <button className="button darkButton" type="button">Sign in</button>
        </form>
        <p className="small">Demo UI — connect this form to your authentication provider before production.</p>
      </div>
    </main>
  );
}