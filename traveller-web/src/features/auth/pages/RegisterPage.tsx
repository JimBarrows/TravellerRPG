import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Create Account</h2>
        <p className="text-muted-foreground mt-2">
          Join the Traveller universe
        </p>
      </div>
      
      <form className="space-y-6">
        <div>
          <label className="label block mb-2">Username</label>
          <input
            type="text"
            className="input"
            placeholder="Choose a username"
            required
          />
        </div>
        
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
            placeholder="Create a password"
            required
          />
        </div>
        
        <div>
          <label className="label block mb-2">Confirm Password</label>
          <input
            type="password"
            className="input"
            placeholder="Confirm your password"
            required
          />
        </div>
        
        <div className="flex items-center">
          <input type="checkbox" className="mr-2" required />
          <span className="text-sm">
            I agree to the{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </span>
        </div>
        
        <button type="submit" className="btn btn-primary w-full">
          Create Account
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;