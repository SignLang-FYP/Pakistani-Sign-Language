import SignLangBrand from "@/components/brand/SignLangBrand";
import AuthSlideshow from "@/components/auth/AuthSlideshow";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <div className="hidden h-screen lg:block">
        <AuthSlideshow />
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[360px]">
          <SignLangBrand />
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
