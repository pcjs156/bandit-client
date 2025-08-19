import { AuthPageLayout } from "@src/components/auth/AuthPageLayout";
import { RegisterForm } from "@src/components/auth/RegisterForm";

/**
 * 회원가입 페이지
 */
function RegisterPage() {
  return (
    <AuthPageLayout
      title="회원가입"
      footerText="이미 계정이 있으신가요?"
      footerLinkText="로그인"
      footerLinkTo="/login"
    >
      <RegisterForm />
    </AuthPageLayout>
  );
}

export default RegisterPage;
