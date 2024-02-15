import React, { useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import usePasswordToggle from "../../hook/usePasswordToggle";
import { useToast } from "@chakra-ui/react";
import config from "../../config/config";

function PasswordReset() {
  const [passwordInputType, ToggleIcon] = usePasswordToggle();
  const [passwordInputType1, ToggleIcon1] = usePasswordToggle();
  const emailForgotPass = useRef();
  const emailForgotPass1 = useRef();
  const navigate = useNavigate();
  const toast = useToast();

  const handleForgotPass = () => {
    if (emailForgotPass.current.value !== emailForgotPass1.current.value) {
      toast({
        title: "Password and Confirm Password not matched!",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } else {
      const mailInfo = {
        password: emailForgotPass.current.value,
        token: localStorage.getItem("token"),
      };
      const host = config.BCKHOST;
      axios
        .post(`${host}/customer/resetpass`, mailInfo)
        .then((result) => {
          if (result.data.status === 200) {
            toast({
              title: "Password Successfully Updated!",
              status: "success",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });
            navigate("/success-pass-change");
            localStorage.removeItem("token");
          } else {
            toast({
              title: "Something went wrong!",
              status: "warning",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });
          }
        })
        .catch((err) => {
          toast({
            title: "Password reset link is wrong or expired!",
            status: "warning",
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
        });
    }
  };

  return (
    <div className="container-fluid" id={"login"}>
      <div className="row">
        <div className="col-md-6">
          <div className="card bg-theme">
            <div className="card-header">
              <h4>Reset Password?</h4>
            </div>
            <div className="card-body">
              <label className={"w-100"}>
                <p>New Password*</p>
              </label>
              <div className="input-group mb-3">
                <input
                  className={"form-control"}
                  type={passwordInputType}
                  name={"password"}
                  id="password"
                  placeholder="Enter your password"
                  ref={emailForgotPass}
                  minLength={8}
                  maxLength={16}
                  required
                />
                <span className="input-group-text">{ToggleIcon}</span>
              </div>

              <label className={"w-100 mt-2"}>
                <p>Confirm Password*</p>
              </label>
              <div className="input-group mb-3">
                <input
                  className={"form-control"}
                  type={passwordInputType1}
                  name={"password1"}
                  id="password1"
                  placeholder="Enter your password"
                  ref={emailForgotPass1}
                  minLength={8}
                  maxLength={16}
                  required
                />
                <span className="input-group-text">{ToggleIcon1}</span>
              </div>

              <div className="d-grid mt-3 pb-2">
                <button
                  className={"btn btn-outline-warning"}
                  onClick={handleForgotPass}
                >
                  Submit
                </button>

                <p className="mt-2" style={{ color: "white" }}>
                  Don't have any account please{" "}
                  <span
                    onClick={() => navigate("/register")}
                    style={{ color: "yellow", cursor: "pointer" }}
                  >
                    Register
                  </span>
                  <br></br>
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

export default PasswordReset;
