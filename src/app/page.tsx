
import Login from "@/app/login/page";
import ForgotPassword from "./forgotpass/page";
import Signup from "./signup/page";


export default function Home() {
  return (
    <div>
      <Login/>
      <ForgotPassword/>
      <Signup/>
    </div>
  );
}
