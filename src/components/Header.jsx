import React from 'react';
import logo from './images/logo_py.jpg';

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo and Group Name */}
          <div className="flex items-center">
            {/* Updated Logo */}
            <img 
              src={logo}
              alt="Pydah Logo" 
              className="w-32 h-18 mr-4"
            />
            {/* <div>
              <h1 className="text-2xl font-bold text-gray-800">PYDAH GROUP</h1>
              <p className="text-sm text-gray-600">Education & Beyond</p>
            </div> */}
          </div>

          {/* College Information */}
          <div className="text-center md:text-right mt-4 md:mt-0">
            <h2 className="text-xl font-semibold text-gray-800">Pydah College Of Engineering</h2>
            <p className="text-sm text-gray-600">An Autonomous Institution</p>
            <p className="text-sm text-gray-600">Kakinada | Andhra Pradesh | INDIA</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
