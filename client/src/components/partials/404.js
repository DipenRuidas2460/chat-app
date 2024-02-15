import React from "react";

const NotFound = () => {
  return (
    <div >
      <h1 >404 - Not Found</h1>
      <h5 >
        Sorry, the page you are looking for does not exist please{" "}
        <a href="/">
          <u>click here</u>
        </a>{" "}
        to login for access this page.
      </h5>
    </div>
  );
};

export default NotFound;
