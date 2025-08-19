import { Navigate } from "react-router-dom";
import { useAuthStore } from "@src/stores/authStore";
import { Loader, Center } from "@mantine/core";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 인증이 필요한 페이지를 보호하는 컴포넌트
 * 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useAuthStore();

  // 로딩 중일 때
  if (status === "loading" || status === "idle") {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
}

export default ProtectedRoute;
