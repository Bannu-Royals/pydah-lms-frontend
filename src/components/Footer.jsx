import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Campus Life Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Campus Life</h3>
            <ul className="space-y-2">
              <li>NCC & NSS Cell</li>
              <li>Clubs & Activities</li>
              <li>Professional Bodies</li>
              <li>College Events</li>
              <li>Campus News Letter</li>
            </ul>
          </div>

          {/* Admissions Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Admissions</h3>
            <p>Contact: +91 73824 56539 | +91 73820 15999</p>
            <p>Email: admissions@pydah.edu.in</p>
          </div>

          {/* Placements Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Placements</h3>
            <p>Contact: +91 98496 17788</p>
            <p>Email: tpo@pydah.edu.in</p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>Key Contacts</li>
              <li>Alumni</li>
              <li>e-office</li>
              <li>Careers</li>
              <li>NAAC</li>
              <li>AQAR</li>
              <li>Webmaster Login</li>
            </ul>
          </div>
        </div>

        {/* Contact Information and Address */}
        <div className="mt-8 border-t border-gray-700 pt-8">
          
          <div className="text-center mt-4">
            <h3 className="text-lg font-semibold">Pydah College of Engineering</h3>
            <p>An Autonomous institution with NAAC Grade A.</p>
            <p>Established in 2009 to impart highest quality education in Andhra Pradesh.</p>
            <p>Kakinada - Yanam Road, Patavala, Tallarevu (M), Kakinada District, Andhra Pradesh, India</p>
            <p>Pincode 533461</p>
            <p>EAPCET/POLYCET/ECET/PGECET CODE: PYDE</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;