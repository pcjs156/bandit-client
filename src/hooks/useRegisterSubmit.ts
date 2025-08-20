import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@src/stores/authStore";
import type { RegisterRequest } from "@src/types/api";
import type { UseFormReturnType } from "@mantine/form";

/**
 * 회원가입 제출 로직을 관리하는 커스텀 훅
 */
export function useRegisterSubmit() {
  const navigate = useNavigate();
  const { register, status, error, clearError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (values: RegisterRequest) => {
      setIsLoading(true);
      clearError();

      try {
        await register(values);
        navigate("/"); // 회원가입 성공 시 홈으로 이동
      } catch {
        // 에러는 store에서 관리됨
      } finally {
        setIsLoading(false);
      }
    },
    [register, navigate, clearError],
  );

  const isSubmitDisabled = useCallback(
    (form: UseFormReturnType<RegisterRequest>) => {
      return (
        !form.values.userId ||
        !form.values.password ||
        !form.values.nickname ||
        !!form.errors.userId ||
        !!form.errors.password ||
        !!form.errors.nickname
      );
    },
    [],
  );

  const isFormDisabled = isLoading || status === "loading";

  return {
    handleSubmit,
    isSubmitDisabled,
    isFormDisabled,
    isLoading,
    error,
    status,
  };
}
