import SignLangBrand from "@/components/brand/SignLangBrand";
import AuthSlideshow from "@/components/auth/AuthSlideshow";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:block h-screen">
  <AuthSlideshow />
</div>

      <div className="flex items-center justify-center bg-gradient-to-br from-[#FF6D00] via-[#FF8F00] to-white px-8">
        <div className="w-full max-w-md flex flex-col items-center">
          <SignLangBrand />

           <SignupForm />
        </div>
      </div>
    </div>
  );
}