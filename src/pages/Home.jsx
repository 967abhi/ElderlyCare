import home from "../assets/banner.png";
import {
  FaClipboardCheck,
  FaHeart,
  FaClipboardList,
  FaUserFriends,
  FaTint,
  FaHome,
} from "react-icons/fa";
import KhyaalClubBenefits from "../components/KhyaalClubBenefits";

const services = [
  {
    title: "Hourly Care",
    description:
      "With our hourly-based care you will never have to face an emergency alone!",
    icon: <FaClipboardCheck size={48} />,
  },
  {
    title: "Live-in Care",
    description:
      "When we're required to provide 24/7 care, live-in is the best option to go for!",
    icon: <FaHeart size={48} />,
  },
  {
    title: "Overnight Care",
    description:
      "Designed specifically for cases when acute temporary oversight is needed.",
    icon: <FaClipboardList size={48} />,
  },
  {
    title: "Alzheimer’s Care",
    description:
      "We take care of both the elderly people with Alzheimer’s and Dementia.",
    icon: <FaUserFriends size={48} />,
  },
  {
    title: "Nursing Care",
    description:
      "Provided on an as-required basis, it is usually for post-accident care.",
    icon: <FaTint size={48} />,
  },
  {
    title: "Palliative Care",
    description: "This service includes all types of permanent caregiving.",
    icon: <FaHome size={48} />,
  },
];

const Home = () => {
  return (
    <section className="">
      <div
        className=""
        style={{
          backgroundImage: `url(${home})`,
          backgroundSize: "cover", // Ensures the image covers the entire width and height
          backgroundPosition: "center", // Centers the image
          backgroundRepeat: "no-repeat", // Prevents the image from repeating
          width: "100%", // Ensures it fits the container width
          height: "100vh", // Makes the background image cover the full viewport height
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 h-full ">
          <div className="flex flex-col gap-4 text-start justify-center h-full font-Poppins">
            {/* <p className="text-4xl font-extrabold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent"> */}
            <p className="text-base uppercase font-semibold  text-[#01b43e] font-Poppins">
              welcome to elderlycare
            </p>
            <p className="text-6xl font-semibold  text-white font-Poppins">
              Find Your Caregiver <br></br>
              <span className="text-6xl">in a Flash.</span>
            </p>
            <h1 className="text-xl font-light  text-white font-sans">
              Find the perfect caregiver for your loved ones with just a few
              clicks.
            </h1>
            <div className="mt-2 flex flex-row justify-start gap-16">
              <button className="mt-4 w-32 h-10 bg-[#0c376f] text-white font-Poppins text-xl rounded-md">
                Sign up
              </button>
              <button className="mt-4 w-32 h-10 bg-[#0c376f] text-white font-Poppins text-xl rounded-md">
                Log In
              </button>
            </div>
          </div>
          {/* adding affordable section  */}
          <div className="flex flex-row justify-between bg-[#ffff] w-full h-20 mt-8">
            <div className="flex flex-row  justify-center text-center gap-2 ">
              <div className="flex flex-col justify-center ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  width="50" // You can adjust the width as needed
                  height="50" // You can adjust the height as needed
                >
                  <path
                    fill="#0c376f"
                    d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col justify-center font-Poppins">
                <h1 className="text-[#181818] font-semibold text-2xl">
                  Affordable
                </h1>
                <p className="flex justify-start">Lorem Ipsum</p>
              </div>
            </div>
            <div className="flex flex-row justify-center text-center  gap-2">
              {/* <img
              src="https://oxentictemplates.in/templatemonster/retirement/images/icon-img-4.png"
              alt=""
            /> */}
              <div className="flex flex-col justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  width="50" // Adjust width as needed
                  height="50" // Adjust height as needed
                >
                  <path
                    fill="#0c376f"
                    d="M256 48C141.1 48 48 141.1 48 256l0 40c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-40C0 114.6 114.6 0 256 0S512 114.6 512 256l0 144.1c0 48.6-39.4 88-88.1 88L313.6 488c-8.3 14.3-23.8 24-41.6 24l-32 0c-26.5 0-48-21.5-48-48s21.5-48 48-48l32 0c17.8 0 33.3 9.7 41.6 24l110.4 .1c22.1 0 40-17.9 40-40L464 256c0-114.9-93.1-208-208-208zM144 208l16 0c17.7 0 32 14.3 32 32l0 112c0 17.7-14.3 32-32 32l-16 0c-35.3 0-64-28.7-64-64l0-48c0-35.3 28.7-64 64-64zm224 0c35.3 0 64 28.7 64 64l0 48c0 35.3-28.7 64-64 64l-16 0c-17.7 0-32-14.3-32-32l0-112c0-17.7 14.3-32 32-32l16 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col justify-center font-Poppins">
                <h1 className="text-[#181818] font-semibold text-2xl">
                  Online Support
                </h1>
                <p className="flex justify-start">Lorem Ipsum</p>
              </div>
            </div>
            <div className="flex flex-row  justify-center text-center gap-2 ">
              <div className="flex flex-col justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  width="50" // You can adjust the width as needed
                  height="50" // You can adjust the height as needed
                >
                  <path
                    fill="#0c376f"
                    d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col justify-center font-Poppins">
                <h1 className="text-[#181818] font-semibold text-2xl">
                  Expert Staffs
                </h1>
                <p className="flex justify-start">Lorem Ipsum</p>
              </div>
            </div>
            <div className="flex flex-row  justify-center text-center gap-2 ">
              <div className="flex flex-col justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  width="50" // You can adjust the width as needed
                  height="50" // You can adjust the height as needed
                >
                  <path
                    fill="#0c376f"
                    d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col justify-center font-Poppins">
                <h1 className="text-[#181818] font-semibold text-2xl">
                  Secure System
                </h1>
                <p className="flex justify-start">Lorem Ipsum</p>
              </div>
            </div>
          </div>
          {/* adding affordable section  */}
          {/* testing */}

          {/* testing */}
        </div>
        {/* Elderly care service start  */}
        <div className="bg-gray-50 mt-[132px] ">
          <div className=" py-28 max-w-screen-xl mx-auto px-4 ">
            <h2 className="text-6xl font-bold text-center font-Poppins text-[#0c376f]   mb-10">
              Elderly Care Services
            </h2>
            <div className="flex justify-center gap-10 flex-wrap">
              {services.map((service, index) => (
                <div key={index} className="text-center max-w-xs flex flex-col">
                  <div className="text-[#0c376f] mb-4 ml-[130px] ">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2 font-Poppins">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 font-Poppins text-base">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Elderly care service end  */}
        {/* services section  */}
        <KhyaalClubBenefits />
        {/* services section  */}
      </div>
    </section>
  );
};

export default Home;
