// src/components/Layout.js
// import React from "react";
import { Outlet } from "react-router-dom"; // To render the routed components
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

const Layout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet /> {/* This renders the current page's component */}
      </main>
      <Footer />
    </>
  );
};

export default Layout;

// =====================
// import { Outlet } from "react-router-dom"; // To render the routed components
// import Header from "./Header.jsx";
// import Footer from "./Footer.jsx";

// const Layout = () => {
//   return (
//     <div className="flex flex-col min-h-screen">
//       <Header />
//       <main className="">
//         <Outlet /> {/* This renders the current page's component */}
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default Layout;
