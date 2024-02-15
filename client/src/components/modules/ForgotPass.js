import React, { useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import config from "../../config/config";

function ForgotPass() {
  const emailForgotPass = useRef();
  const navigate = useNavigate();
  const toast = useToast();

  const handleForgotPass = () => {
    const mailInfo = { email: emailForgotPass.current.value };
    const host = config.BCKHOST;
    axios
      .post(`${host}/customer/forgotpass`, mailInfo)
      .then((result) => {
        if (result.data.status === "success") {
          localStorage.setItem("token", result.data.token);
          toast({
            title: "Link will be sent to your email for update password!",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
          navigate("/mailsent");
        }
      })
      .catch((err) => {
        console.log(err.message)
        toast({
          title: "You don't any account please register first!",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      });
  };

  return (
    <div className="container-fluid" id={"login"}>
      <div className="row">
        <div className="col-md-6">
          <div className="card bg-theme">
            <div className="card-header">
              <h4>Update Password?</h4>
            </div>
            <div className="card-body">
              <label className={"w-100"}>
                <p>Email*</p>
                <input
                  className={"form-control"}
                  type={"text"}
                  name={"email"}
                  placeholder="Enter your email"
                  ref={emailForgotPass}
                  required
                />
              </label>

              <div className="d-grid mt-3 pb-2">
                <button
                  className={"btn btn-outline-warning"}
                  onClick={handleForgotPass}
                >
                  Sent Reset Link
                </button>

                <p className="mt-2" style={{ color: "white" }}>
                  If Continue to{" "}
                  <span
                    onClick={() => navigate("/")}
                    style={{ color: "yellow", cursor: "pointer" }}
                  >
                    LogIn
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPass;
