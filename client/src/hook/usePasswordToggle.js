import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function usePasswordToggle() {
  const [showPassword, setShowPassword] = useState(false);
  const Icon = (
    <FontAwesomeIcon
      icon={showPassword ? "eye-slash" : "eye"}
      onClick={() => setShowPassword(!showPassword)}
    />
  );
  const InputType = showPassword ? "text" : "password";
  return [InputType, Icon];
}

export default usePasswordToggle;