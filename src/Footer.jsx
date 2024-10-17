const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-[1800px] ">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center max-w-screen-xl px-4">
        <div className="mb-4 md:mb-0">
          <h2 className="text-lg font-bold font-Poppins">
            Elderly Care Services
          </h2>
          <p className="text-sm w-[350px] font-Poppins text-light">
            Providing compassionate and professional caregiving services
            tailored to your loved ones needs.
          </p>
        </div>
        <div className="flex flex-col md:flex-row font-Poppins leading-8">
          <div className="mr-8">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="text-sm">
              <li>
                <a href="#" className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="font-Poppins leading-8">
            <h3 className="font-semibold">Contact Us</h3>
            <p className="text-sm">Email: abhishekksingh393@gmail.com</p>
            <p className="text-sm">Phone: 6299843186</p>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-xs font-Poppins font-semibold">
        <p>
          &copy; {new Date().getFullYear()} Elderly Care Services. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
