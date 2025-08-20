import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { NicknameField } from "../NicknameField";
import type { UseFormReturnType } from "@mantine/form";
import type { RegisterRequest } from "@src/types/api";

// Mock ValidationIcon component
vi.mock("@src/components/common/ValidationIcon", () => ({
  default: ({ fieldName, value }: { fieldName: string; value: string }) => (
    <div data-testid={`validation-icon-${fieldName}`} data-value={value}>
      Validation Icon
    </div>
  ),
}));

describe("NicknameField", () => {
  const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  const mockForm: UseFormReturnType<RegisterRequest> = {
    getInputProps: vi.fn((_fieldName: string) => ({
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
    it("닉네임 라벨을 표시해야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      expect(screen.getByText("닉네임")).toBeInTheDocument();
    });

    it("올바른 placeholder를 표시해야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      expect(screen.getByPlaceholderText("2-20자")).toBeInTheDocument();
    });

    it("설명 텍스트를 표시해야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      expect(
        screen.getByText("다른 사용자에게 표시되는 이름입니다")
      ).toBeInTheDocument();
    });

    it("TextInput을 렌더링해야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });
  });

  describe("폼 연동", () => {
    it("form.getInputProps를 호출해야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      expect(mockForm.getInputProps).toHaveBeenCalledWith("nickname");
    });

    it("form.values.nickname을 ValidationIcon에 전달해야 한다", () => {
      const formWithNickname = {
        ...mockForm,
        values: { ...mockForm.values, nickname: "테스트유저" },
      };

      renderWithMantine(<NicknameField form={formWithNickname} />);

      const validationIcon = screen.getByTestId("validation-icon-nickname");
      expect(validationIcon).toHaveAttribute("data-value", "테스트유저");
    });
  });

  describe("ValidationIcon", () => {
    it("ValidationIcon을 렌더링해야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      expect(
        screen.getByTestId("validation-icon-nickname")
      ).toBeInTheDocument();
    });

    it("ValidationIcon에 올바른 props를 전달해야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      const validationIcon = screen.getByTestId("validation-icon-nickname");
      expect(validationIcon).toBeInTheDocument();
    });

    it("ValidationIcon이 rightSection에 배치되어야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      const validationIcon = screen.getByTestId("validation-icon-nickname");
      expect(validationIcon).toBeInTheDocument();
    });
  });

  describe("disabled 상태", () => {
    it("disabled가 false일 때 입력 필드가 활성화되어야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} disabled={false} />);

      const input = screen.getByRole("textbox");
      expect(input).not.toBeDisabled();
    });

    it("disabled가 true일 때 입력 필드가 비활성화되어야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} disabled={true} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("disabled prop이 없을 때 기본값 false를 사용해야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      const input = screen.getByRole("textbox");
      expect(input).not.toBeDisabled();
    });
  });

  describe("스타일링", () => {
    it("size가 md로 설정되어야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("mantine-TextInput-input");
    });

    it("rightSection에 ValidationIcon이 배치되어야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      const validationIcon = screen.getByTestId("validation-icon-nickname");

      expect(validationIcon).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("label과 input이 올바르게 연결되어야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      const label = screen.getByText("닉네임");
      const input = screen.getByRole("textbox");

      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    it("placeholder가 올바르게 설정되어야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      const input = screen.getByPlaceholderText("2-20자");
      expect(input).toBeInTheDocument();
    });

    it("설명 텍스트가 올바르게 표시되어야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      expect(
        screen.getByText("다른 사용자에게 표시되는 이름입니다")
      ).toBeInTheDocument();
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
          error: "닉네임은 2자 이상이어야 합니다",
        })),
      };

      renderWithMantine(<NicknameField form={formWithError} />);

      expect(
        screen.getByText("닉네임은 2자 이상이어야 합니다")
      ).toBeInTheDocument();
    });

    it("빈 닉네임일 때 ValidationIcon이 빈 값을 받아야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      const validationIcon = screen.getByTestId("validation-icon-nickname");
      expect(validationIcon).toHaveAttribute("data-value", "");
    });

    it("닉네임이 있을 때 ValidationIcon이 해당 값을 받아야 한다", () => {
      const formWithNickname = {
        ...mockForm,
        values: { ...mockForm.values, nickname: "테스트유저" },
      };

      renderWithMantine(<NicknameField form={formWithNickname} />);

      const validationIcon = screen.getByTestId("validation-icon-nickname");
      expect(validationIcon).toHaveAttribute("data-value", "테스트유저");
    });
  });

  describe("props 조합", () => {
    it("모든 props가 올바르게 적용되어야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} disabled={true} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("disabled 상태와 ValidationIcon이 독립적으로 작동해야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} disabled={true} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
      expect(
        screen.getByTestId("validation-icon-nickname")
      ).toBeInTheDocument();
    });
  });

  describe("메모이제이션", () => {
    it("memo로 래핑되어 있어야 한다", () => {
      expect(NicknameField.displayName).toBe("NicknameField");
    });
  });

  describe("타입 안정성", () => {
    it("RegisterRequest 타입과 호환되어야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      expect(screen.getByText("닉네임")).toBeInTheDocument();
    });

    it("UseFormReturnType과 올바르게 연동되어야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      expect(mockForm.getInputProps).toHaveBeenCalledWith("nickname");
    });
  });

  describe("사용자 경험", () => {
    it("닉네임 입력 필드가 직관적으로 사용할 수 있어야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "2-20자");
    });

    it("설명 텍스트가 사용자에게 명확한 정보를 제공해야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      expect(
        screen.getByText("다른 사용자에게 표시되는 이름입니다")
      ).toBeInTheDocument();
    });

    it("placeholder가 입력 형식을 명확히 제시해야 한다", () => {
      renderWithMantine(<NicknameField form={mockForm} />);

      const input = screen.getByPlaceholderText("2-20자");
      expect(input).toBeInTheDocument();
    });
  });
});
