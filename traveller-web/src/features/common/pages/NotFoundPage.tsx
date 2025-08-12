import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-muted-foreground mb-4">404</h1>
          <h2 className="text-3xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground text-lg">
            The page you're looking for doesn't exist in this sector of space.
          </p>
        </div>
        
        <div className="space-x-4">
          <Link to="/" className="btn btn-primary">
            Return Home
          </Link>
          <Link to="/dashboard/characters" className="btn btn-outline">
            Go to Dashboard
          </Link>
        </div>
        
        <div className="mt-12 text-muted-foreground">
          <svg 
            className="mx-auto h-24 w-24 mb-4 opacity-50" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" 
            />
          </svg>
          <p>Lost in the void between worlds</p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;