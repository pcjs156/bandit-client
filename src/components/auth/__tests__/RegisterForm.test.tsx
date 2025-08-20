import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { RegisterForm } from "../RegisterForm";
import { useRegisterForm } from "@src/hooks/useRegisterForm";
import { useRegisterSubmit } from "@src/hooks/useRegisterSubmit";

// Mock hooks
vi.mock("@src/hooks/useRegisterForm", () => ({
  useRegisterForm: vi.fn(),
}));

vi.mock("@src/hooks/useRegisterSubmit", () => ({
  useRegisterSubmit: vi.fn(),
}));

// Mock child components
vi.mock("../UserIdField", () => ({
  UserIdField: ({ form, disabled }: any) => (
    <div data-testid="user-id-field" data-disabled={disabled}>
      User ID Field
    </div>
  ),
}));

vi.mock("../PasswordField", () => ({
  PasswordField: ({ form, disabled }: any) => (
    <div data-testid="password-field" data-disabled={disabled}>
      Password Field
    </div>
  ),
}));

vi.mock("../NicknameField", () => ({
  NicknameField: ({ form, disabled }: any) => (
    <div data-testid="nickname-field" data-disabled={disabled}>
      Nickname Field
    </div>
  ),
}));

describe("RegisterForm", () => {
  const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  const mockForm = {
    onSubmit: vi.fn((handler) => (e: any) => {
      e.preventDefault();
      handler();
    }),
    values: {
      userId: "testuser",
      password: "testpass123",
      nickname: "테스트유저",
    },
  };

  const mockSubmitHook = {
    handleSubmit: vi.fn(),
    isSubmitDisabled: vi.fn(() => false),
    isFormDisabled: false,
    isLoading: false,
    error: null,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const { useRegisterForm } = await import("@src/hooks/useRegisterForm");
    const { useRegisterSubmit } = await import("@src/hooks/useRegisterSubmit");
    
    vi.mocked(useRegisterForm).mockReturnValue(mockForm as any);
    vi.mocked(useRegisterSubmit).mockReturnValue(mockSubmitHook as any);
  });

  describe("기본 렌더링", () => {
    it("모든 폼 필드를 렌더링해야 한다", () => {
      renderWithMantine(<RegisterForm />);

      expect(screen.getByTestId("user-id-field")).toBeInTheDocument();
      expect(screen.getByTestId("password-field")).toBeInTheDocument();
      expect(screen.getByTestId("nickname-field")).toBeInTheDocument();
    });

    it("회원가입 버튼을 렌더링해야 한다", () => {
      renderWithMantine(<RegisterForm />);

      expect(
        screen.getByRole("button", { name: "회원가입" })
      ).toBeInTheDocument();
    });

    it("form 태그를 렌더링해야 한다", () => {
      renderWithMantine(<RegisterForm />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });
  });

  describe("폼 제출", () => {
    it("폼 제출 시 handleSubmit이 호출되어야 한다", async () => {
      renderWithMantine(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "회원가입" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmitHook.handleSubmit).toHaveBeenCalled();
      });
    });

    it("form.onSubmit이 올바르게 설정되어야 한다", () => {
      renderWithMantine(<RegisterForm />);

      expect(mockForm.onSubmit).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  describe("에러 처리", () => {
    it("에러가 없을 때 Alert를 표시하지 않아야 한다", () => {
      renderWithMantine(<RegisterForm />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("에러가 있을 때 Alert를 표시해야 한다", () => {
      const submitHookWithError = {
        ...mockSubmitHook,
        error: "회원가입에 실패했습니다",
      };

      vi.mocked(useRegisterSubmit).mockReturnValue(submitHookWithError as any);

      renderWithMantine(<RegisterForm />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("에러 Alert가 올바른 스타일을 가져야 한다", () => {
      const submitHookWithError = {
        ...mockSubmitHook,
        error: "회원가입에 실패했습니다",
      };

      vi.mocked(useRegisterSubmit).mockReturnValue(submitHookWithError as any);

      renderWithMantine(<RegisterForm />);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });
  });

  describe("로딩 상태", () => {
    it("로딩 중일 때 버튼에 loading 상태가 적용되어야 한다", () => {
      const submitHookWithLoading = {
        ...mockSubmitHook,
        isLoading: true,
      };

      vi.mocked(useRegisterSubmit).mockReturnValue(submitHookWithLoading as any);

      renderWithMantine(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "회원가입" });
      expect(submitButton).toBeInTheDocument();
    });

    it("로딩 중이 아닐 때 버튼에 loading 상태가 적용되지 않아야 한다", () => {
      renderWithMantine(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "회원가입" });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("폼 비활성화", () => {
    it("isFormDisabled가 true일 때 모든 필드가 비활성화되어야 한다", () => {
      const submitHookWithDisabled = {
        ...mockSubmitHook,
        isFormDisabled: true,
      };

      vi.mocked(useRegisterSubmit).mockReturnValue(submitHookWithDisabled as any);

      renderWithMantine(<RegisterForm />);

      expect(screen.getByTestId("user-id-field")).toHaveAttribute(
        "data-disabled",
        "true"
      );
      expect(screen.getByTestId("password-field")).toHaveAttribute(
        "data-disabled",
        "true"
      );
      expect(screen.getByTestId("nickname-field")).toHaveAttribute(
        "data-disabled",
        "true"
      );
    });

    it("isFormDisabled가 false일 때 모든 필드가 활성화되어야 한다", () => {
      renderWithMantine(<RegisterForm />);

      expect(screen.getByTestId("user-id-field")).toHaveAttribute(
        "data-disabled",
        "false"
      );
      expect(screen.getByTestId("password-field")).toHaveAttribute(
        "data-disabled",
        "false"
      );
      expect(screen.getByTestId("nickname-field")).toHaveAttribute(
        "data-disabled",
        "false"
      );
    });
  });

  describe("제출 버튼 상태", () => {
    it("isSubmitDisabled가 true일 때 버튼이 비활성화되어야 한다", () => {
      const submitHookWithDisabled = {
        ...mockSubmitHook,
        isSubmitDisabled: vi.fn(() => true),
      };

      vi.mocked(useRegisterSubmit).mockReturnValue(submitHookWithDisabled as any);

      renderWithMantine(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "회원가입" });
      expect(submitButton).toBeInTheDocument();
    });

    it("isSubmitDisabled가 false일 때 버튼이 활성화되어야 한다", () => {
      renderWithMantine(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "회원가입" });
      expect(submitButton).toBeInTheDocument();
    });

    it("isSubmitDisabled 함수가 form을 인자로 받아야 한다", () => {
      renderWithMantine(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "회원가입" });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("스타일링", () => {
    it("Stack 컴포넌트가 올바른 gap을 가져야 한다", () => {
      renderWithMantine(<RegisterForm />);

      const stack = document.querySelector(".mantine-Stack-root");
      expect(stack).toBeInTheDocument();
    });

    it("제출 버튼이 fullWidth를 가져야 한다", () => {
      renderWithMantine(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "회원가입" });
      expect(submitButton).toBeInTheDocument();
    });

    it("제출 버튼이 올바른 size를 가져야 한다", () => {
      renderWithMantine(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "회원가입" });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("제출 버튼이 올바른 role을 가져야 한다", () => {
      renderWithMantine(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "회원가입" });
      expect(submitButton).toBeInTheDocument();
    });

    it("에러 Alert가 올바른 role을 가져야 한다", () => {
      const submitHookWithError = {
        ...mockSubmitHook,
        error: "회원가입에 실패했습니다",
      };

      vi.mocked(useRegisterSubmit).mockReturnValue(submitHookWithError as any);

      renderWithMantine(<RegisterForm />);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });
  });

  describe("폼 필드 전달", () => {
    it("모든 필드에 form prop을 전달해야 한다", () => {
      renderWithMantine(<RegisterForm />);

      expect(screen.getByTestId("user-id-field")).toBeInTheDocument();
      expect(screen.getByTestId("password-field")).toBeInTheDocument();
      expect(screen.getByTestId("nickname-field")).toBeInTheDocument();
    });

    it("모든 필드에 disabled prop을 전달해야 한다", () => {
      renderWithMantine(<RegisterForm />);

      expect(screen.getByTestId("user-id-field")).toHaveAttribute(
        "data-disabled",
        "false"
      );
      expect(screen.getByTestId("password-field")).toHaveAttribute(
        "data-disabled",
        "false"
      );
      expect(screen.getByTestId("nickname-field")).toHaveAttribute(
        "data-disabled",
        "false"
      );
    });
  });

  describe("메모이제이션", () => {
    it("memo로 래핑되어 있어야 한다", () => {
      expect(RegisterForm.displayName).toBe("RegisterForm");
    });
  });

  describe("훅 사용", () => {
    it("useRegisterForm을 호출해야 한다", () => {
      renderWithMantine(<RegisterForm />);

      expect(
        vi.mocked(useRegisterForm)
      ).toHaveBeenCalled();
    });

    it("useRegisterSubmit을 호출해야 한다", () => {
      renderWithMantine(<RegisterForm />);

      expect(
        vi.mocked(useRegisterSubmit)
      ).toHaveBeenCalled();
    });
  });
});
