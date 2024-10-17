// src/components/KhyaalClubBenefits.jsx
// import React from 'react';

const benefits = [
  "Book caregiver now",
  "Access to qualified and experienced caregivers who provide high-quality care tailored to individual needs",
  " Caregivers can be booked for various durations, whether it’s a few hours a day, full-time, or live-in care.",
  " Families can have peace of mind knowing their loved ones are in capable hands, ensuring their safety and well-being.",
  "Quick access to caregivers in case of emergencies or unexpected health issues.",

  "Engage in fun games and educational sessions that not only entertain but also promote cognitive stimulation and learning for elderly individuals.",

  "Refer & earn",
];

const KhyaalClubBenefits = () => {
  return (
    <div className="bg-white p-8 md:p-16  ">
      <h2 className="text-2xl md:text-4xl font-bold text-brown-700 mb-6 max-w-screen-xl mx-auto px-4">
        Amazing benefits of the Elderly Care
      </h2>
      <div className="flex flex-row md:flex-row  max-w-screen-xl mx-auto px-4">
        <div className="flex-1 flex flex-col gap-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start w-[600px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12l5 5L20 7"
                />
              </svg>
              <p className="text-lg font-Poppins text-brown-800 ">{benefit}</p>
            </div>
          ))}
          <button className="  font-medium text-[34px]  hover:text-gray-900 focus:outline-none w-[250px] h-12 bg-[#0c376f] text-white font-Poppins text-xl rounded-md">
            Book Now
          </button>
        </div>
        {/* ==== */}

        {/* ==== */}
        {/* ==== */}
        <div className="flex justify-center mt-8 ">
          <img
            src="https://www.khyaal.com/images/home-screen.webp" // Replace with the actual path of your image
            alt="Khyaal Club"
            className="w-[300px] rounded-lg shadow-lg mr-[100px] mt-[-50px]"
          />
        </div>
        {/* ==== */}
      </div>
    </div>
  );
};

export default KhyaalClubBenefits;
