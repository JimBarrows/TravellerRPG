import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-space flex items-center justify-center">
      <div className="text-center text-white max-w-4xl mx-auto px-6">
        <h1 className="text-8xl font-display font-bold mb-6 text-gradient-traveller">
          Traveller
        </h1>
        <p className="text-2xl mb-8 text-gray-300">
          Embark on epic adventures across the galaxy in the ultimate
          science fiction role-playing experience
        </p>
        <div className="space-x-4">
          <Link
            to="/auth/login"
            className="btn btn-primary px-8 py-3 text-lg"
          >
            Get Started
          </Link>
          <Link
            to="/auth/register"
            className="btn btn-outline px-8 py-3 text-lg"
          >
            Create Account
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-black bg-opacity-30 p-6 rounded-lg backdrop-blur-sm">
            <div className="h-12 w-12 bg-accent rounded-lg mb-4 flex items-center justify-center">
              <svg className="h-6 w-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Characters</h3>
            <p className="text-gray-300">
              Build unique characters with detailed backgrounds, skills, and equipment
            </p>
          </div>
          
          <div className="bg-black bg-opacity-30 p-6 rounded-lg backdrop-blur-sm">
            <div className="h-12 w-12 bg-primary rounded-lg mb-4 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Manage Campaigns</h3>
            <p className="text-gray-300">
              Organize your adventures and track campaign progression
            </p>
          </div>
          
          <div className="bg-black bg-opacity-30 p-6 rounded-lg backdrop-blur-sm">
            <div className="h-12 w-12 bg-destructive rounded-lg mb-4 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Play Sessions</h3>
            <p className="text-gray-300">
              Run interactive sessions with integrated tools and automation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;