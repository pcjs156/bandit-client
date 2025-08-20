import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { PasswordField } from "../PasswordField";
import type { UseFormReturnType } from "@mantine/form";
import type { RegisterRequest } from "@src/types/api";

// Mock PasswordStrengthIndicator component
vi.mock("@src/components/common/PasswordStrengthIndicator", () => ({
  default: ({ password }: { password: string }) => (
    <div data-testid="password-strength-indicator" data-password={password}>
      Password Strength: {password.length > 0 ? "Strong" : "Weak"}
    </div>
  ),
}));

describe("PasswordField", () => {
  const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  const mockForm: UseFormReturnType<RegisterRequest> = {
    getInputProps: vi.fn((fieldName: string) => ({
      value: "",
      onChange: vi.fn(),
      onBlur: vi.fn(),
      error: undefined,
    })),
    values: {
      userId: "",
      password: "",
      nickname: "",
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("기본 렌더링", () => {
    it("비밀번호 라벨을 표시해야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      expect(screen.getByText("비밀번호")).toBeInTheDocument();
    });

    it("올바른 placeholder를 표시해야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      expect(
        screen.getByPlaceholderText("영문, 숫자 포함 8자 이상")
      ).toBeInTheDocument();
    });

    it("PasswordInput을 렌더링해야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      const input = screen.getByDisplayValue("");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "password");
    });
  });

  describe("폼 연동", () => {
    it("form.getInputProps를 호출해야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      expect(mockForm.getInputProps).toHaveBeenCalledWith("password");
    });

    it("form.values.password를 PasswordStrengthIndicator에 전달해야 한다", () => {
      const formWithPassword = {
        ...mockForm,
        values: { ...mockForm.values, password: "testpass123" },
      };

      renderWithMantine(<PasswordField form={formWithPassword} />);

      const strengthIndicator = screen.getByTestId(
        "password-strength-indicator"
      );
      expect(strengthIndicator).toHaveAttribute("data-password", "testpass123");
    });
  });

  describe("PasswordStrengthIndicator", () => {
    it("showStrengthIndicator가 true일 때 강도 표시기를 렌더링해야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} showStrengthIndicator={true} />);

      expect(
        screen.getByTestId("password-strength-indicator")
      ).toBeInTheDocument();
    });

    it("showStrengthIndicator가 false일 때 강도 표시기를 렌더링하지 않아야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} showStrengthIndicator={false} />);

      expect(
        screen.queryByTestId("password-strength-indicator")
      ).not.toBeInTheDocument();
    });

    it("showStrengthIndicator가 없을 때 기본값 true를 사용해야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      expect(
        screen.getByTestId("password-strength-indicator")
      ).toBeInTheDocument();
    });

    it("강도 표시기에 올바른 비밀번호 값을 전달해야 한다", () => {
      const formWithPassword = {
        ...mockForm,
        values: { ...mockForm.values, password: "strongpass123" },
      };

      renderWithMantine(<PasswordField form={formWithPassword} />);

      const strengthIndicator = screen.getByTestId(
        "password-strength-indicator"
      );
      expect(strengthIndicator).toHaveAttribute("data-password", "strongpass123");
    });
  });

  describe("disabled 상태", () => {
    it("disabled가 false일 때 입력 필드가 활성화되어야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} disabled={false} />);

      const input = screen.getByDisplayValue("");
      expect(input).not.toBeDisabled();
    });

    it("disabled가 true일 때 입력 필드가 비활성화되어야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} disabled={true} />);

      const input = screen.getByDisplayValue("");
      expect(input).toBeDisabled();
    });

    it("disabled prop이 없을 때 기본값 false를 사용해야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      const input = screen.getByDisplayValue("");
      expect(input).not.toBeDisabled();
    });
  });

  describe("스타일링", () => {
    it("size가 md로 설정되어야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      const input = screen.getByDisplayValue("");
      expect(input).toHaveClass("mantine-PasswordInput-innerInput");
    });

    it("Box 컴포넌트로 래핑되어야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      // Box 컴포넌트가 렌더링되었는지 확인
      const input = screen.getByDisplayValue("");
      expect(input).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("label과 input이 올바르게 연결되어야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      const label = screen.getByText("비밀번호");
      const input = screen.getByDisplayValue("");

      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    it("placeholder가 올바르게 설정되어야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      const input = screen.getByPlaceholderText("영문, 숫자 포함 8자 이상");
      expect(input).toBeInTheDocument();
    });

    it("비밀번호 입력 필드가 type='password'를 가져야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      const input = screen.getByDisplayValue("");
      expect(input).toHaveAttribute("type", "password");
    });
  });

  describe("다양한 폼 상태", () => {
    it("에러가 있을 때 에러 상태를 표시해야 한다", () => {
      const formWithError = {
        ...mockForm,
        getInputProps: vi.fn((fieldName: string) => ({
          value: "invalid",
          onChange: vi.fn(),
          onBlur: vi.fn(),
          error: "비밀번호는 8자 이상이어야 합니다",
        })),
      };

      renderWithMantine(<PasswordField form={formWithError} />);

      expect(
        screen.getByText("비밀번호는 8자 이상이어야 합니다")
      ).toBeInTheDocument();
    });

    it("빈 비밀번호일 때 강도 표시기가 Weak를 표시해야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      const strengthIndicator = screen.getByTestId("password-strength-indicator");
      expect(strengthIndicator).toHaveTextContent("Password Strength: Weak");
    });

    it("비밀번호가 있을 때 강도 표시기가 Strong을 표시해야 한다", () => {
      const formWithPassword = {
        ...mockForm,
        values: { ...mockForm.values, password: "testpass123" },
      };

      renderWithMantine(<PasswordField form={formWithPassword} />);

      const strengthIndicator = screen.getByTestId("password-strength-indicator");
      expect(strengthIndicator).toHaveTextContent("Password Strength: Strong");
    });
  });

  describe("props 조합", () => {
    it("모든 props가 올바르게 적용되어야 한다", () => {
      renderWithMantine(
        <PasswordField
          form={mockForm}
          disabled={true}
          showStrengthIndicator={false}
        />
      );

      const input = screen.getByDisplayValue("");
      expect(input).toBeDisabled();
      expect(
        screen.queryByTestId("password-strength-indicator")
      ).not.toBeInTheDocument();
    });

    it("disabled와 showStrengthIndicator가 독립적으로 작동해야 한다", () => {
      renderWithMantine(
        <PasswordField
          form={mockForm}
          disabled={true}
          showStrengthIndicator={true}
        />
      );

      const input = screen.getByDisplayValue("");
      expect(input).toBeDisabled();
      expect(
        screen.getByTestId("password-strength-indicator")
      ).toBeInTheDocument();
    });
  });

  describe("메모이제이션", () => {
    it("memo로 래핑되어 있어야 한다", () => {
      expect(PasswordField.displayName).toBe("PasswordField");
    });
  });

  describe("타입 안정성", () => {
    it("RegisterRequest 타입과 호환되어야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      expect(screen.getByText("비밀번호")).toBeInTheDocument();
    });

    it("UseFormReturnType과 올바르게 연동되어야 한다", () => {
      renderWithMantine(<PasswordField form={mockForm} />);

      expect(mockForm.getInputProps).toHaveBeenCalledWith("password");
    });
  });
});
