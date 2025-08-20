import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRegisterSubmit } from "../useRegisterSubmit";
import { useAuthStore } from "@src/stores/authStore";
import { useNavigate } from "react-router-dom";
import type { RegisterRequest } from "@src/types/api";
import type { UseFormReturnType } from "@mantine/form";

// 모킹
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@src/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

const mockedUseNavigate = vi.mocked(useNavigate);
const mockedUseAuthStore = vi.mocked(useAuthStore);

describe("useRegisterSubmit", () => {
  const mockNavigate = vi.fn();
  const mockRegister = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseNavigate.mockReturnValue(mockNavigate);
    mockedUseAuthStore.mockReturnValue({
      register: mockRegister,
      status: "idle" as const,
      error: null,
      clearError: mockClearError,
      // 다른 필요한 store 속성들
      user: null,
      token: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  describe("초기 상태", () => {
    it("초기값이 올바르게 설정되어야 한다", () => {
      const { result } = renderHook(() => useRegisterSubmit());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.status).toBe("idle");
      expect(result.current.isFormDisabled).toBe(false);
      expect(typeof result.current.handleSubmit).toBe("function");
      expect(typeof result.current.isSubmitDisabled).toBe("function");
    });
  });

  describe("handleSubmit", () => {
    const validRegisterData: RegisterRequest = {
      userId: "testuser",
      password: "testPassword123!",
      nickname: "테스트유저",
    };

    it("성공적인 회원가입 시 홈으로 이동해야 한다", async () => {
      mockRegister.mockResolvedValue(undefined);
      const { result } = renderHook(() => useRegisterSubmit());

      await act(async () => {
        await result.current.handleSubmit(validRegisterData);
      });

      expect(mockClearError).toHaveBeenCalled();
      expect(mockRegister).toHaveBeenCalledWith(validRegisterData);
      expect(mockNavigate).toHaveBeenCalledWith("/");
      expect(result.current.isLoading).toBe(false);
    });

    it("회원가입 실패 시 에러를 처리해야 한다", async () => {
      const error = new Error("회원가입 실패");
      mockRegister.mockRejectedValue(error);
      const { result } = renderHook(() => useRegisterSubmit());

      await act(async () => {
        await result.current.handleSubmit(validRegisterData);
      });

      expect(mockClearError).toHaveBeenCalled();
      expect(mockRegister).toHaveBeenCalledWith(validRegisterData);
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    it("제출 중에는 isLoading이 true여야 한다", async () => {
      let resolveRegister: () => void;
      const registerPromise = new Promise<void>((resolve) => {
        resolveRegister = resolve;
      });
      mockRegister.mockReturnValue(registerPromise);

      const { result } = renderHook(() => useRegisterSubmit());

      // 제출 시작
      act(() => {
        result.current.handleSubmit(validRegisterData);
      });

      expect(result.current.isLoading).toBe(true);

      // 제출 완료
      await act(async () => {
        resolveRegister!();
        await registerPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("isSubmitDisabled", () => {
    const createMockForm = (
      values: Partial<RegisterRequest>,
      errors: Partial<Record<keyof RegisterRequest, string>> = {},
    ): UseFormReturnType<RegisterRequest> =>
      ({
        values: {
          userId: "",
          password: "",
          nickname: "",
          ...values,
        },
        errors: {
          userId: undefined,
          password: undefined,
          nickname: undefined,
          ...errors,
        },
        // 다른 필요한 form 속성들 (실제 사용되지 않는 것들)
        setValues: vi.fn(),
        setErrors: vi.fn(),
        setFieldValue: vi.fn(),
        setFieldError: vi.fn(),
        clearFieldError: vi.fn(),
        clearErrors: vi.fn(),
        reset: vi.fn(),
        validate: vi.fn(),
        isValid: vi.fn(),
        isDirty: vi.fn(),
        isTouched: vi.fn(),
        getInputProps: vi.fn(),
        onSubmit: vi.fn(),
        onReset: vi.fn(),
        insertListItem: vi.fn(),
        removeListItem: vi.fn(),
        reorderListItem: vi.fn(),
        replaceListItem: vi.fn(),
        getTransformedValues: vi.fn(),
        key: "test-form",
        initialized: true,
        dirty: {},
        touched: {},
      }) as unknown as UseFormReturnType<RegisterRequest>;

    it("모든 필드가 채워지고 에러가 없으면 false를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterSubmit());
      const form = createMockForm({
        userId: "testuser",
        password: "testPassword123!",
        nickname: "테스트유저",
      });

      const isDisabled = result.current.isSubmitDisabled(form);

      expect(isDisabled).toBe(false);
    });

    it("userId가 없으면 true를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterSubmit());
      const form = createMockForm({
        userId: "",
        password: "testPassword123!",
        nickname: "테스트유저",
      });

      const isDisabled = result.current.isSubmitDisabled(form);

      expect(isDisabled).toBe(true);
    });

    it("password가 없으면 true를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterSubmit());
      const form = createMockForm({
        userId: "testuser",
        password: "",
        nickname: "테스트유저",
      });

      const isDisabled = result.current.isSubmitDisabled(form);

      expect(isDisabled).toBe(true);
    });

    it("nickname이 없으면 true를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterSubmit());
      const form = createMockForm({
        userId: "testuser",
        password: "testPassword123!",
        nickname: "",
      });

      const isDisabled = result.current.isSubmitDisabled(form);

      expect(isDisabled).toBe(true);
    });

    it("userId에 에러가 있으면 true를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterSubmit());
      const form = createMockForm(
        {
          userId: "test",
          password: "testPassword123!",
          nickname: "테스트유저",
        },
        {
          userId: "사용자 ID가 너무 짧습니다",
        },
      );

      const isDisabled = result.current.isSubmitDisabled(form);

      expect(isDisabled).toBe(true);
    });

    it("password에 에러가 있으면 true를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterSubmit());
      const form = createMockForm(
        {
          userId: "testuser",
          password: "weak",
          nickname: "테스트유저",
        },
        {
          password: "비밀번호가 너무 약합니다",
        },
      );

      const isDisabled = result.current.isSubmitDisabled(form);

      expect(isDisabled).toBe(true);
    });

    it("nickname에 에러가 있으면 true를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterSubmit());
      const form = createMockForm(
        {
          userId: "testuser",
          password: "testPassword123!",
          nickname: "a",
        },
        {
          nickname: "닉네임이 너무 짧습니다",
        },
      );

      const isDisabled = result.current.isSubmitDisabled(form);

      expect(isDisabled).toBe(true);
    });
  });

  describe("isFormDisabled", () => {
    it("isLoading이 true일 때 true를 반환해야 한다", async () => {
      let resolveRegister: () => void;
      const registerPromise = new Promise<void>((resolve) => {
        resolveRegister = resolve;
      });
      mockRegister.mockReturnValue(registerPromise);

      const { result } = renderHook(() => useRegisterSubmit());

      act(() => {
        result.current.handleSubmit({
          userId: "test",
          password: "test123!",
          nickname: "테스트",
        });
      });

      expect(result.current.isFormDisabled).toBe(true);

      await act(async () => {
        resolveRegister!();
        await registerPromise;
      });

      expect(result.current.isFormDisabled).toBe(false);
    });

    it("status가 loading일 때 true를 반환해야 한다", () => {
      mockedUseAuthStore.mockReturnValue({
        register: mockRegister,
        status: "loading" as const,
        error: null,
        clearError: mockClearError,
        user: null,
        token: null,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useRegisterSubmit());

      expect(result.current.isFormDisabled).toBe(true);
    });

    it("isLoading이 false이고 status가 idle일 때 false를 반환해야 한다", () => {
      const { result } = renderHook(() => useRegisterSubmit());

      expect(result.current.isFormDisabled).toBe(false);
    });
  });

  describe("에러 상태", () => {
    it("store의 에러를 올바르게 반환해야 한다", () => {
      const testError = "회원가입에 실패했습니다";
      mockedUseAuthStore.mockReturnValue({
        register: mockRegister,
        status: "error" as const,
        error: testError,
        clearError: mockClearError,
        user: null,
        token: null,
        isAuthenticated: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useRegisterSubmit());

      expect(result.current.error).toBe(testError);
      expect(result.current.status).toBe("error");
    });
  });
});
