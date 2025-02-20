import React from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Home() {
  const navigate = useNavigate();

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-around px-6 py-16 md:py-32 bg-gradient-to-t from-blue-400 to-blue-600 text-white mt-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold">Staff Leave Management System</h1>
          <p className="mt-4 text-lg">
            Streamline leave tracking for faculty, and staff effortlessly.
          </p>
          <button
            className="mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-100"
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>
        </div>

        {/* Slider Section */}
        <div className="mt-8 md:mt-0 max-w-2xl w-full">
          <Slider {...sliderSettings}>
            <div>
              <img
                src="https://static.wixstatic.com/media/bfee2e_a361f3557fc440c98d1d2edf8c1f0d1f~mv2.jpg/v1/fill/w_1891,h_783,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/bfee2e_a361f3557fc440c98d1d2edf8c1f0d1f~mv2.jpg"
                alt="College Campus"
                className="rounded-lg w-full"
              />
            </div>
            <div>
              <img
                src="https://www.vidyavision.com/CollegeUploads/Photos/2019-30-3-15-05-13_Screenshot%20(160).png"
                alt="College Campus"
                className="rounded-lg w-full h-64"
              />
            </div>
            {/* Add more slides as needed */}
          </Slider>
        </div>
      </div>

      {/* Pydah College Content Section */}
      <div className="flex py-16 px-6 bg-white flex-row justify-around">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-32 items-center">
          {/* Image Section */}
          <div className="relative" data-aos="flip-left">
            <img
              src="https://th.bing.com/th/id/OIP.uc2B-J44DXlC6K8TXYJFVwHaHa?rs=1&pid=ImgDetMain"
              alt="Pydah"
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>

          {/* Text Section */}
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800">About Pydah College of Engineering</h2>
            <p className="mt-4 text-lg text-gray-600">
              Pydah College of Engineering is a prestigious institution located in the fast-developing smart city of Kakinada, Andhra Pradesh. Established in 2009, it offers a range of undergraduate and postgraduate engineering courses.
            </p>
            <p className="mt-4 text-gray-600">
              The campus spans over 40 acres and is equipped with state-of-the-art infrastructure. The institution prioritizes ethical values and provides world-class education through its dedicated faculty, many of whom come from premier institutes such as IITs.
            </p>
            <p className="mt-4 text-gray-600">
              With an excellent campus placement record, students are well-prepared for industry roles, with top companies such as HCL, Tech Mahindra, and Aurobindo visiting the campus for recruitment drives.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
<div className="py-16 px-6 bg-gradient-to-b from-blue-400 to-blue-600">
  <div className="max-w-5xl mx-auto text-center">
    <h2 className="text-3xl font-bold text-gray-800">Why Choose Our System?</h2>
    <p className="mt-2 text-black">A seamless leave management experience for organizations.</p>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-10 max-w-5xl mx-auto">
    <div className="p-6 bg-gray-100 rounded-lg shadow">
      <h3 className="text-xl font-semibold text-blue-600">Employee Leave Requests</h3>
      <p className="text-gray-600 mt-2">Employees can apply for leave with ease.</p>
    </div>
    <div className="p-6 bg-gray-100 rounded-lg shadow">
      <h3 className="text-xl font-semibold text-blue-600">Manager Approvals</h3>
      <p className="text-gray-600 mt-2">Managers can approve or decline leave requests instantly.</p>
    </div>
    <div className="p-6 bg-gray-100 rounded-lg shadow">
      <h3 className="text-xl font-semibold text-blue-600">Admin Dashboard</h3>
      <p className="text-gray-600 mt-2">Admins can track leave records efficiently.</p>
    </div>
  </div>
</div>
      {/* Contact Section */}
      <div className="py-16 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Need Assistance?</h2>
        <p className="mt-2 text-gray-600">Reach out to our college admin for help.</p>
        <button
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700"
        >
          Contact Admin
        </button>
      </div>
    </div>
  );
}
