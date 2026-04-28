import SignLangBrand from "@/components/brand/SignLangBrand";
import AuthSlideshow from "@/components/auth/AuthSlideshow";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side */}
      <div className="hidden lg:block h-screen">
  <AuthSlideshow />
</div>

      {/* Right Side */}
      <div className="flex items-center justify-center bg-gradient-to-br from-[#FF6D00] via-[#FF8F00] to-white px-8">
        <div className="w-full max-w-md flex flex-col items-center">
          <SignLangBrand />

          <LoginForm />
        </div>
      </div>
    </div>
  );
}