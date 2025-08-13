import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-space relative">
        <div className="flex items-center justify-center w-full">
          <div className="text-center text-white">
            <h1 className="text-6xl font-display font-bold mb-4 text-gradient-traveller">
              Traveller
            </h1>
            <p className="text-xl text-gray-300">
              Journey among the stars
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
      </div>
      
      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center lg:hidden">
            <h1 className="text-4xl font-display font-bold text-gradient-traveller mb-2">
              Traveller
            </h1>
            <p className="text-muted-foreground">Journey among the stars</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;