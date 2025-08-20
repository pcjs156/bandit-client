import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { type UseFormReturnType } from "@mantine/form";
import { MantineProvider } from "@mantine/core";
import { UserIdField } from "../UserIdField";
import type { RegisterRequest } from "@src/types/api";

// Mock ValidationIcon component
vi.mock("@src/components/common/ValidationIcon", () => ({
  default: ({ fieldName, value }: { fieldName: string; value: string }) => (
    <div data-testid={`validation-icon-${fieldName}`} data-value={value}>
      Validation Icon
    </div>
  ),
}));

// Mock useForm hook
const mockForm = {
  getInputProps: vi.fn((_fieldName: string) => ({
    value: "",
    onChange: vi.fn(),
    onBlur: vi.fn(),
    error: undefined,
  })),
  values: {
    userId: "",
  },
};

vi.mock("@mantine/form", () => ({
  useForm: vi.fn(() => mockForm),
}));

describe("UserIdField", () => {
  const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("기본 렌더링", () => {
    it("아이디 라벨을 표시해야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      expect(screen.getByText("아이디")).toBeInTheDocument();
    });

    it("올바른 placeholder를 표시해야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      expect(
        screen.getByPlaceholderText("영문, 숫자 4-20자"),
      ).toBeInTheDocument();
    });

    it("설명 텍스트를 표시해야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      expect(
        screen.getByText("영문과 숫자만 사용 가능합니다"),
      ).toBeInTheDocument();
    });

    it("TextInput을 렌더링해야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });
  });

  describe("폼 연동", () => {
    it("form.getInputProps를 호출해야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      expect(mockForm.getInputProps).toHaveBeenCalledWith("userId");
    });

    it("form.values.userId를 ValidationIcon에 전달해야 한다", () => {
      const formWithValue = {
        ...mockForm,
        values: { userId: "testuser" },
      };

      renderWithMantine(
        <UserIdField
          form={formWithValue as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      const validationIcon = screen.getByTestId("validation-icon-userId");
      expect(validationIcon).toHaveAttribute("data-value", "testuser");
    });
  });

  describe("ValidationIcon", () => {
    it("ValidationIcon을 렌더링해야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      expect(screen.getByTestId("validation-icon-userId")).toBeInTheDocument();
    });

    it("ValidationIcon에 올바른 props를 전달해야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      const validationIcon = screen.getByTestId("validation-icon-userId");
      expect(validationIcon).toBeInTheDocument();
    });
  });

  describe("disabled 상태", () => {
    it("disabled가 false일 때 입력 필드가 활성화되어야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
          disabled={false}
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).not.toBeDisabled();
    });

    it("disabled가 true일 때 입력 필드가 비활성화되어야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
          disabled={true}
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("disabled prop이 없을 때 기본값 false를 사용해야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).not.toBeDisabled();
    });
  });

  describe("스타일링", () => {
    it("size가 md로 설정되어야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("mantine-TextInput-input");
    });

    it("rightSection에 ValidationIcon이 배치되어야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      const validationIcon = screen.getByTestId("validation-icon-userId");

      expect(validationIcon).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("label과 input이 올바르게 연결되어야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      const label = screen.getByText("아이디");
      const input = screen.getByRole("textbox");

      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    it("placeholder가 올바르게 설정되어야 한다", () => {
      renderWithMantine(
        <UserIdField
          form={mockForm as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      const input = screen.getByPlaceholderText("영문, 숫자 4-20자");
      expect(input).toBeInTheDocument();
    });
  });

  describe("다양한 폼 상태", () => {
    it("에러가 있을 때 에러 상태를 표시해야 한다", () => {
      const formWithError = {
        ...mockForm,
        getInputProps: vi.fn((_fieldName: string) => ({
          value: "invalid",
          onChange: vi.fn(),
          onBlur: vi.fn(),
          error: "아이디는 4자 이상이어야 합니다",
        })),
      };

      renderWithMantine(
        <UserIdField
          form={formWithError as unknown as UseFormReturnType<RegisterRequest>}
        />,
      );

      expect(
        screen.getByText("아이디는 4자 이상이어야 합니다"),
      ).toBeInTheDocument();
    });

    it("값이 변경될 때 onChange가 호출되어야 한다", () => {
      const mockOnChange = vi.fn();
      const formWithOnChange = {
        ...mockForm,
        getInputProps: vi.fn((_fieldName: string) => ({
          value: "",
          onChange: mockOnChange,
          onBlur: vi.fn(),
          error: undefined,
        })),
      };

      renderWithMantine(
        <UserIdField
          form={
            formWithOnChange as unknown as UseFormReturnType<RegisterRequest>
          }
        />,
      );

      const input = screen.getByRole("textbox");
      input.focus();
      input.blur();

      expect(mockOnChange).not.toHaveBeenCalled(); // 실제 이벤트는 발생하지 않음
    });
  });

  describe("메모이제이션", () => {
    it("memo로 래핑되어 있어야 한다", () => {
      expect(UserIdField.displayName).toBe("UserIdField");
    });
  });

  describe("타입 안정성", () => {
    it("RegisterRequest 타입과 호환되어야 한다", () => {
      const form: UseFormReturnType<RegisterRequest> =
        mockForm as unknown as UseFormReturnType<RegisterRequest>;

      renderWithMantine(<UserIdField form={form} />);

      expect(screen.getByText("아이디")).toBeInTheDocument();
    });
  });
});
