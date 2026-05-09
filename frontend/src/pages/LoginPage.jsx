import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6">
      {/* Glow effects */}
      <div className="absolute top-[-100px] h-[300px] w-[300px] rounded-full bg-purple-500/20 blur-3xl"></div>

      <div className="absolute bottom-[-100px] right-0 h-[300px] w-[300px] rounded-full bg-blue-500/20 blur-3xl"></div>

      {/* Form */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
