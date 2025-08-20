import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import ValidationIcon from "../ValidationIcon";
import type { RegisterRequest } from "@src/types/api";

// Mock @tabler/icons-react
vi.mock("@tabler/icons-react", () => ({
  IconCheck: ({ size, color }: { size: number; color: string }) => (
    <div data-testid="icon-check" data-size={size} data-color={color}>
      ✓
    </div>
  ),
  IconX: ({ size, color }: { size: number; color: string }) => (
    <div data-testid="icon-x" data-size={size} data-color={color}>
      ✗
    </div>
  ),
}));

// Test wrapper component with form
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

describe("ValidationIcon", () => {
  const createMockForm = (errors: Record<string, string | null> = {}) => {
    const mockForm = {
      validateField: vi.fn((fieldName: string) => ({
        error: errors[fieldName] || null,
      })),
    } as unknown as UseFormReturnType<RegisterRequest>;

    return mockForm;
  };

  describe("기본 렌더링", () => {
    it("value가 없을 때 아무것도 렌더링하지 않아야 한다", () => {
      const mockForm = createMockForm();
      render(
        <TestWrapper>
          <ValidationIcon form={mockForm} fieldName="userId" value="" />
        </TestWrapper>,
      );

      expect(screen.queryByTestId("icon-check")).not.toBeInTheDocument();
      expect(screen.queryByTestId("icon-x")).not.toBeInTheDocument();
    });
  });

  describe("에러 상태 렌더링", () => {
    it("에러가 있을 때 IconX를 렌더링해야 한다", () => {
      const mockForm = createMockForm({ userId: "사용자 ID는 필수입니다" });

      render(
        <TestWrapper>
          <ValidationIcon form={mockForm} fieldName="userId" value="test" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("icon-x")).toBeInTheDocument();
      expect(screen.queryByTestId("icon-check")).not.toBeInTheDocument();
    });

    it("IconX가 올바른 props를 가져야 한다", () => {
      const mockForm = createMockForm({ userId: "에러 메시지" });

      render(
        <TestWrapper>
          <ValidationIcon form={mockForm} fieldName="userId" value="test" />
        </TestWrapper>,
      );

      const iconX = screen.getByTestId("icon-x");
      expect(iconX).toHaveAttribute("data-size", "16");
      expect(iconX).toHaveAttribute("data-color", "red");
    });

    it("에러 메시지가 빈 문자열일 때는 IconCheck를 렌더링해야 한다", () => {
      const mockForm = createMockForm({ userId: "" });

      render(
        <TestWrapper>
          <ValidationIcon form={mockForm} fieldName="userId" value="test" />
        </TestWrapper>,
      );

      // 빈 문자열은 falsy이므로 에러가 없는 것으로 간주
      expect(screen.getByTestId("icon-check")).toBeInTheDocument();
      expect(screen.queryByTestId("icon-x")).not.toBeInTheDocument();
    });
  });

  describe("성공 상태 렌더링", () => {
    it("에러가 없을 때 IconCheck를 렌더링해야 한다", () => {
      const mockForm = createMockForm({ userId: null });

      render(
        <TestWrapper>
          <ValidationIcon form={mockForm} fieldName="userId" value="test" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("icon-check")).toBeInTheDocument();
      expect(screen.queryByTestId("icon-x")).not.toBeInTheDocument();
    });

    it("IconCheck가 올바른 props를 가져야 한다", () => {
      const mockForm = createMockForm({ userId: null });

      render(
        <TestWrapper>
          <ValidationIcon form={mockForm} fieldName="userId" value="test" />
        </TestWrapper>,
      );

      const iconCheck = screen.getByTestId("icon-check");
      expect(iconCheck).toHaveAttribute("data-size", "16");
      expect(iconCheck).toHaveAttribute("data-color", "green");
    });
  });

  describe("폼 검증", () => {
    it("form.validateField를 올바른 fieldName으로 호출해야 한다", () => {
      const mockForm = createMockForm();

      render(
        <TestWrapper>
          <ValidationIcon form={mockForm} fieldName="nickname" value="test" />
        </TestWrapper>,
      );

      expect(mockForm.validateField).toHaveBeenCalledWith("nickname");
    });

    it("다양한 fieldName에 대해 올바르게 작동해야 한다", () => {
      const fieldNames: Array<keyof RegisterRequest> = [
        "userId",
        "password",
        "nickname",
      ];

      fieldNames.forEach((fieldName) => {
        const mockForm = createMockForm();
        const { unmount } = render(
          <TestWrapper>
            <ValidationIcon
              form={mockForm}
              fieldName={fieldName}
              value="test"
            />
          </TestWrapper>,
        );

        expect(mockForm.validateField).toHaveBeenCalledWith(fieldName);
        unmount();
      });
    });
  });

  describe("다양한 값 타입", () => {
    it("문자열 값에 대해 올바르게 작동해야 한다", () => {
      const mockForm = createMockForm();

      render(
        <TestWrapper>
          <ValidationIcon
            form={mockForm}
            fieldName="userId"
            value="testuser123"
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId("icon-check")).toBeInTheDocument();
    });

    it("짧은 문자열 값에 대해 올바르게 작동해야 한다", () => {
      const mockForm = createMockForm();

      render(
        <TestWrapper>
          <ValidationIcon form={mockForm} fieldName="userId" value="a" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("icon-check")).toBeInTheDocument();
    });

    it("긴 문자열 값에 대해 올바르게 작동해야 한다", () => {
      const mockForm = createMockForm();
      const longValue = "a".repeat(1000);

      render(
        <TestWrapper>
          <ValidationIcon
            form={mockForm}
            fieldName="userId"
            value={longValue}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId("icon-check")).toBeInTheDocument();
    });
  });

  describe("에러 메시지 처리", () => {
    it("긴 에러 메시지를 처리할 수 있어야 한다", () => {
      const longErrorMessage =
        "이 필드는 매우 긴 에러 메시지를 가질 수 있으며, 이는 컴포넌트가 올바르게 렌더링되어야 함을 의미합니다";
      const mockForm = createMockForm({ userId: longErrorMessage });

      render(
        <TestWrapper>
          <ValidationIcon form={mockForm} fieldName="userId" value="test" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("icon-x")).toBeInTheDocument();
    });

    it("특수문자가 포함된 에러 메시지를 처리할 수 있어야 한다", () => {
      const specialErrorMessage = "에러! @#$%^&*()_+-=[]{}|;':\",./<>?";
      const mockForm = createMockForm({ userId: specialErrorMessage });

      render(
        <TestWrapper>
          <ValidationIcon form={mockForm} fieldName="userId" value="test" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("icon-x")).toBeInTheDocument();
    });
  });

  describe("Props 검증", () => {
    it("모든 필수 props가 올바르게 전달되어야 한다", () => {
      const mockForm = createMockForm();

      render(
        <TestWrapper>
          <ValidationIcon
            form={mockForm}
            fieldName="password"
            value="testpassword"
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId("icon-check")).toBeInTheDocument();
      expect(mockForm.validateField).toHaveBeenCalledWith("password");
    });

    it("form prop이 올바르게 사용되어야 한다", () => {
      const mockForm = createMockForm();

      render(
        <TestWrapper>
          <ValidationIcon
            form={mockForm}
            fieldName="nickname"
            value="testnickname"
          />
        </TestWrapper>,
      );

      expect(mockForm.validateField).toHaveBeenCalled();
    });

    it("fieldName prop이 올바르게 사용되어야 한다", () => {
      const mockForm = createMockForm();

      render(
        <TestWrapper>
          <ValidationIcon form={mockForm} fieldName="userId" value="testuser" />
        </TestWrapper>,
      );

      expect(mockForm.validateField).toHaveBeenCalledWith("userId");
    });

    it("value prop이 올바르게 사용되어야 한다", () => {
      const mockForm = createMockForm();

      render(
        <TestWrapper>
          <ValidationIcon
            form={mockForm}
            fieldName="userId"
            value="testvalue"
          />
        </TestWrapper>,
      );

      // value가 있으면 아이콘이 렌더링되어야 함
      expect(screen.getByTestId("icon-check")).toBeInTheDocument();
    });
  });

  describe("경계값 테스트", () => {
    it("빈 문자열이 아닌 공백만 있는 값도 처리해야 한다", () => {
      const mockForm = createMockForm();

      render(
        <TestWrapper>
          <ValidationIcon form={mockForm} fieldName="userId" value="   " />
        </TestWrapper>,
      );

      // 공백만 있는 값은 truthy로 처리되어야 함
      expect(screen.getByTestId("icon-check")).toBeInTheDocument();
    });

    it("0 문자도 처리해야 한다", () => {
      const mockForm = createMockForm();

      render(
        <TestWrapper>
          <ValidationIcon form={mockForm} fieldName="userId" value="0" />
        </TestWrapper>,
      );

      expect(screen.getByTestId("icon-check")).toBeInTheDocument();
    });
  });
});
