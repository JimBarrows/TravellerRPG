import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Welcome back</h2>
        <p className="text-muted-foreground mt-2">
          Sign in to your Traveller account
        </p>
      </div>
      
      <form className="space-y-6">
        <div>
          <label className="label block mb-2">Email address</label>
          <input
            type="email"
            className="input"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div>
          <label className="label block mb-2">Password</label>
          <input
            type="password"
            className="input"
            placeholder="Enter your password"
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm">Remember me</span>
          </label>
          <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        
        <button type="submit" className="btn btn-primary w-full">
          Sign in
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary hover:underline">
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;