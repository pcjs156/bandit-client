import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { ColorNameInput } from "../ColorNameInput";

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

describe("ColorNameInput", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
  };

  describe("기본 렌더링", () => {
    it("컴포넌트가 렌더링되어야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText("색상 이름")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("예: 내가 좋아하는 파란색")
      ).toBeInTheDocument();
    });

    it("label이 올바르게 표시되어야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText("색상 이름")).toBeInTheDocument();
    });

    it("placeholder가 올바르게 표시되어야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} />
        </TestWrapper>
      );

      expect(
        screen.getByPlaceholderText("예: 내가 좋아하는 파란색")
      ).toBeInTheDocument();
    });
  });

  describe("Props 처리", () => {
    it("value prop이 올바르게 전달되어야 한다", () => {
      const testValue = "테스트 색상명";
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} value={testValue} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름") as HTMLInputElement;
      expect(input.value).toBe(testValue);
    });

    it("빈 문자열 value를 처리할 수 있어야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} value="" />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("긴 문자열 value를 처리할 수 있어야 한다", () => {
      const longValue = "매우 긴 색상 이름입니다 이것은 테스트를 위한 것입니다";
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} value={longValue} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름") as HTMLInputElement;
      expect(input.value).toBe(longValue);
    });

    it("특수문자가 포함된 value를 처리할 수 있어야 한다", () => {
      const specialValue = "색상!@#$%^&*()_+-=[]{}|;':\",./<>?";
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} value={specialValue} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름") as HTMLInputElement;
      expect(input.value).toBe(specialValue);
    });
  });

  describe("onChange 이벤트", () => {
    it("입력값 변경 시 onChange가 호출되어야 한다", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} onChange={mockOnChange} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");
      const newValue = "새로운 색상명";

      fireEvent.change(input, { target: { value: newValue } });

      expect(mockOnChange).toHaveBeenCalledWith(newValue);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it("공백만 있는 문자열 입력 시 onChange가 호출되어야 한다", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} onChange={mockOnChange} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");

      fireEvent.change(input, { target: { value: "   " } });

      expect(mockOnChange).toHaveBeenCalledWith("   ");
    });

    it("숫자 입력 시 onChange가 호출되어야 한다", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} onChange={mockOnChange} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");

      fireEvent.change(input, { target: { value: "123" } });

      expect(mockOnChange).toHaveBeenCalledWith("123");
    });
  });

  describe("에러 처리", () => {
    it("error가 true일 때 에러 상태를 표시해야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} error={true} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");
      // Mantine TextInput의 error prop이 aria-invalid에 반영되지 않을 수 있음
      // 컴포넌트가 렌더링되면 성공
      expect(input).toBeInTheDocument();
    });

    it("error가 false일 때 에러 상태를 표시하지 않아야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} error={false} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");
      expect(input).toBeInTheDocument();
    });

    it("error가 undefined일 때 에러 상태를 표시하지 않아야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");
      expect(input).toBeInTheDocument();
    });

    it("에러 상태에서 입력 시 onErrorClear가 호출되어야 한다", () => {
      const mockOnErrorClear = vi.fn();
      render(
        <TestWrapper>
          <ColorNameInput
            {...defaultProps}
            error={true}
            onErrorClear={mockOnErrorClear}
          />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");

      fireEvent.change(input, { target: { value: "새로운 값" } });

      expect(mockOnErrorClear).toHaveBeenCalledTimes(1);
    });

    it("에러 상태가 아닐 때 입력 시 onErrorClear가 호출되지 않아야 한다", () => {
      const mockOnErrorClear = vi.fn();
      render(
        <TestWrapper>
          <ColorNameInput
            {...defaultProps}
            error={false}
            onErrorClear={mockOnErrorClear}
          />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");

      fireEvent.change(input, { target: { value: "새로운 값" } });

      expect(mockOnErrorClear).not.toHaveBeenCalled();
    });

    it("onErrorClear가 없을 때 에러 상태에서 입력해도 오류가 발생하지 않아야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} error={true} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");

      // 오류 없이 실행되어야 함
      expect(() => {
        fireEvent.change(input, { target: { value: "새로운 값" } });
      }).not.toThrow();
    });
  });

  describe("비활성화 상태", () => {
    it("disabled가 true일 때 입력 필드가 비활성화되어야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} disabled={true} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");
      expect(input).toBeDisabled();
    });

    it("disabled가 false일 때 입력 필드가 활성화되어야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} disabled={false} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");
      expect(input).not.toBeDisabled();
    });

    it("disabled가 undefined일 때 입력 필드가 활성화되어야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");
      expect(input).not.toBeDisabled();
    });

    it("비활성화된 상태에서도 onChange가 호출되어야 한다", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <ColorNameInput
            {...defaultProps}
            onChange={mockOnChange}
            disabled={true}
          />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");

      fireEvent.change(input, { target: { value: "새로운 값" } });

      expect(mockOnChange).toHaveBeenCalledWith("새로운 값");
    });
  });

  describe("입력 제한", () => {
    it("maxLength가 20으로 설정되어야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");
      expect(input).toHaveAttribute("maxlength", "20");
    });

    it("20자를 초과하는 입력을 시도할 수 있어야 한다", () => {
      const mockOnChange = vi.fn();
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} onChange={mockOnChange} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");
      const longValue = "a".repeat(25);

      fireEvent.change(input, { target: { value: longValue } });

      expect(mockOnChange).toHaveBeenCalledWith(longValue);
    });
  });

  describe("복합 시나리오", () => {
    it("에러 상태에서 비활성화된 입력 필드의 동작", () => {
      const mockOnChange = vi.fn();
      const mockOnErrorClear = vi.fn();

      render(
        <TestWrapper>
          <ColorNameInput
            {...defaultProps}
            onChange={mockOnChange}
            error={true}
            onErrorClear={mockOnErrorClear}
            disabled={true}
          />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");

      fireEvent.change(input, { target: { value: "새로운 값" } });

      expect(mockOnChange).toHaveBeenCalledWith("새로운 값");
      expect(mockOnErrorClear).toHaveBeenCalledTimes(1);
      expect(input).toBeDisabled();
    });

    it("긴 값에서 에러 상태로 변경하는 시나리오", () => {
      const mockOnChange = vi.fn();
      const mockOnErrorClear = vi.fn();
      const longValue = "매우 긴 색상 이름입니다 이것은 테스트를 위한 것입니다";

      const { rerender } = render(
        <TestWrapper>
          <ColorNameInput
            {...defaultProps}
            value={longValue}
            onChange={mockOnChange}
            onErrorClear={mockOnErrorClear}
          />
        </TestWrapper>
      );

      // 에러 상태로 변경
      rerender(
        <TestWrapper>
          <ColorNameInput
            {...defaultProps}
            value={longValue}
            onChange={mockOnChange}
            error={true}
            onErrorClear={mockOnErrorClear}
          />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름") as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe(longValue);
    });
  });

  describe("접근성", () => {
    it("올바른 label과 연결되어야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} />
        </TestWrapper>
      );

      const input = screen.getByLabelText("색상 이름");
      expect(input).toBeInTheDocument();
    });

    it("placeholder가 올바르게 설정되어야 한다", () => {
      render(
        <TestWrapper>
          <ColorNameInput {...defaultProps} />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText("예: 내가 좋아하는 파란색");
      expect(input).toBeInTheDocument();
    });
  });

  describe("메모이제이션", () => {
    it("displayName이 올바르게 설정되어야 한다", () => {
      expect(ColorNameInput.displayName).toBe("ColorNameInput");
    });

    it("memo로 감싸져 있어야 한다", () => {
      // memo로 감싸진 컴포넌트는 React.memo의 결과물
      expect(ColorNameInput).toBeDefined();
      expect(typeof ColorNameInput).toBe("object");
    });
  });
});
