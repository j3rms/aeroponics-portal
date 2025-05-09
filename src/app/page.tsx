
import Login from "@/app/login/page";
import ForgotPassword from "./forgotpass/page";
import Signup from "./signup/page";
import Landing from "./landing/page";


export default function Home() {
  return (
    <div>
      <Landing/>
      <Login/>
      <ForgotPassword/>
      <Signup/>
    </div>
  );
}
