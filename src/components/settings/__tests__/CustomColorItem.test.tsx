import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MantineProvider } from "@mantine/core";
import CustomColorItem from "../CustomColorItem";
import type { CustomColor } from "@src/stores/themeStore";

describe("CustomColorItem", () => {
  const defaultProps = {
    color: {
      id: "custom-blue",
      name: "커스텀 블루",
      value: "#3B82F6",
      shades: ["#1E40AF", "#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"],
    } as CustomColor,
    isSelected: false,
    onSelect: vi.fn(),
    onRemove: vi.fn(),
  };

  const renderWithTheme = (props = {}) => {
    return render(
      <MantineProvider>
        <CustomColorItem {...defaultProps} {...props} />
      </MantineProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("기본 렌더링", () => {
    it("컴포넌트가 올바르게 렌더링되어야 한다", () => {
      renderWithTheme();

      expect(screen.getByText("커스텀 블루")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /커스텀 블루 색상 삭제/ })).toBeInTheDocument();
    });

    it("색상 이름이 표시되어야 한다", () => {
      renderWithTheme();

      expect(screen.getByText("커스텀 블루")).toBeInTheDocument();
    });

    it("색상 스와치가 렌더링되어야 한다", () => {
      renderWithTheme();

      const colorSwatch = document.querySelector(".mantine-ColorSwatch-root");
      expect(colorSwatch).toBeInTheDocument();
    });

    it("삭제 버튼이 렌더링되어야 한다", () => {
      renderWithTheme();

      const deleteButton = screen.getByRole("button", {
        name: /커스텀 블루 색상 삭제/,
      });
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe("상태에 따른 렌더링", () => {
    it("선택되지 않은 상태에서 outline 스타일을 가져야 한다", () => {
      renderWithTheme({ isSelected: false });

      const colorButton = screen.getByRole("button", { name: /커스텀 블루 커스텀 색상/ });
      // Mantine v7에서는 variant가 outline일 때 특정 클래스가 적용됩니다
      expect(colorButton).toHaveClass("mantine-Button-root");
      expect(colorButton).toHaveAttribute("data-variant", "outline");
    });

    it("선택된 상태에서 filled 스타일을 가져야 한다", () => {
      renderWithTheme({ isSelected: true });

      const colorButton = screen.getByRole("button", { name: /커스텀 블루 커스텀 색상 \(현재 선택됨\)/ });
      // Mantine v7에서는 variant가 filled일 때 특정 클래스가 적용됩니다
      expect(colorButton).toHaveClass("mantine-Button-root");
      expect(colorButton).toHaveAttribute("data-variant", "filled");
    });

    it("선택 상태에 따라 aria-pressed 속성이 올바르게 설정되어야 한다", () => {
      const { rerender } = renderWithTheme({ isSelected: false });

      let colorButton = screen.getByRole("button", { name: /커스텀 블루 커스텀 색상/ });
      expect(colorButton).toHaveAttribute("aria-pressed", "false");

      rerender(
        <MantineProvider>
          <CustomColorItem {...defaultProps} isSelected={true} />
        </MantineProvider>
      );

      colorButton = screen.getByRole("button", { name: /커스텀 블루 커스텀 색상 \(현재 선택됨\)/ });
      expect(colorButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("이벤트 처리", () => {
    it("색상 버튼 클릭 시 onSelect가 호출되어야 한다", () => {
      const mockOnSelect = vi.fn();
      renderWithTheme({ onSelect: mockOnSelect });

      const colorButton = screen.getByRole("button", { name: /커스텀 블루 커스텀 색상/ });
      fireEvent.click(colorButton);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it("삭제 버튼 클릭 시 onRemove가 호출되어야 한다", () => {
      const mockOnRemove = vi.fn();
      renderWithTheme({ onRemove: mockOnRemove });

      const deleteButton = screen.getByRole("button", {
        name: /커스텀 블루 색상 삭제/,
      });
      fireEvent.click(deleteButton);

      expect(mockOnRemove).toHaveBeenCalledTimes(1);
    });

    it("이벤트 핸들러가 전달되지 않아도 에러가 발생하지 않아야 한다", () => {
      expect(() => {
        renderWithTheme({ onSelect: undefined, onRemove: undefined });
      }).not.toThrow();
    });
  });

  describe("접근성", () => {
    it("색상 버튼에 적절한 aria-label이 있어야 한다", () => {
      renderWithTheme({ isSelected: false });

      const colorButton = screen.getByRole("button", { name: /커스텀 블루 커스텀 색상/ });
      expect(colorButton).toHaveAttribute("aria-label", "커스텀 블루 커스텀 색상");
    });

    it("선택된 상태에서 aria-label에 선택 상태가 포함되어야 한다", () => {
      renderWithTheme({ isSelected: true });

      const colorButton = screen.getByRole("button", { name: /커스텀 블루 커스텀 색상 \(현재 선택됨\)/ });
      expect(colorButton).toHaveAttribute("aria-label", "커스텀 블루 커스텀 색상 (현재 선택됨)");
    });

    it("삭제 버튼에 적절한 aria-label이 있어야 한다", () => {
      renderWithTheme();

      const deleteButton = screen.getByRole("button", {
        name: /커스텀 블루 색상 삭제/,
      });
      expect(deleteButton).toHaveAttribute("aria-label", "커스텀 블루 색상 삭제");
    });

    it("색상 버튼에 role 속성이 있어야 한다", () => {
      renderWithTheme();

      const colorButton = screen.getByRole("button", { name: /커스텀 블루 커스텀 색상/ });
      expect(colorButton).toHaveAttribute("role", "button");
    });

    it("색상 버튼에 tabIndex가 있어야 한다", () => {
      renderWithTheme();

      const colorButton = screen.getByRole("button", { name: /커스텀 블루 커스텀 색상/ });
      expect(colorButton).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("스타일링", () => {
    it("색상 버튼이 올바른 스타일을 가져야 한다", () => {
      renderWithTheme();

      const colorButton = screen.getByRole("button", { name: /커스텀 블루 커스텀 색상/ });
      expect(colorButton).toHaveClass("mantine-Button-root");
    });

    it("삭제 버튼이 올바른 스타일을 가져야 한다", () => {
      renderWithTheme();

      const deleteButton = screen.getByRole("button", {
        name: /커스텀 블루 색상 삭제/,
      });
      expect(deleteButton).toHaveClass("mantine-ActionIcon-root");
    });

    it("Group 컴포넌트가 올바른 레이아웃을 가져야 한다", () => {
      renderWithTheme();

      const group = document.querySelector(".mantine-Group-root");
      expect(group).toBeInTheDocument();
    });
  });

  describe("조건부 렌더링", () => {
    it("다양한 선택 상태에서 올바르게 렌더링되어야 한다", () => {
      const { rerender } = renderWithTheme({ isSelected: false });

      // 선택되지 않은 상태 확인
      let colorButton = screen.getByRole("button", { name: /커스텀 블루 커스텀 색상/ });
      expect(colorButton).toHaveClass("mantine-Button-root");
      expect(colorButton).toHaveAttribute("data-variant", "outline");

      // 선택된 상태로 변경
      rerender(
        <MantineProvider>
          <CustomColorItem
            color={{ id: "1", name: "커스텀 블루", value: "#0000FF", shades: [] }}
            isSelected={true}
            onSelect={vi.fn()}
            onRemove={vi.fn()}
          />
        </MantineProvider>
      );

      // 선택된 상태 확인
      colorButton = screen.getByRole("button", { name: /커스텀 블루 커스텀 색상 \(현재 선택됨\)/ });
      expect(colorButton).toHaveClass("mantine-Button-root");
      expect(colorButton).toHaveAttribute("data-variant", "filled");
    });

    it("다양한 색상 정보로 렌더링할 수 있어야 한다", () => {
      const { rerender } = renderWithTheme();

      // 기본 색상 확인
      expect(screen.getByText("커스텀 블루")).toBeInTheDocument();

      // 다른 색상으로 변경
      const differentColor: CustomColor = {
        id: "custom-green",
        name: "커스텀 그린",
        value: "#10B981",
        shades: ["#064E3B", "#059669", "#047857", "#065F46", "#04D979"],
      };

      rerender(
        <MantineProvider>
          <CustomColorItem {...defaultProps} color={differentColor} />
        </MantineProvider>
      );

      // 새로운 색상 확인
      expect(screen.getByText("커스텀 그린")).toBeInTheDocument();
    });
  });

  describe("메모이제이션", () => {
    it("memo로 감싸져 있어야 한다", () => {
      // memo로 감싸진 컴포넌트는 displayName이 설정되어 있어야 함
      expect(CustomColorItem.displayName).toBe("CustomColorItem");
    });
  });

  describe("이벤트 처리", () => {
    it("여러 번 클릭해도 올바르게 처리되어야 한다", () => {
      const mockOnSelect = vi.fn();
      renderWithTheme({ onSelect: mockOnSelect });

      const colorButton = screen.getByRole("button", { name: /커스텀 블루 커스텀 색상/ });

      // 여러 번 클릭
      fireEvent.click(colorButton);
      fireEvent.click(colorButton);
      fireEvent.click(colorButton);

      expect(mockOnSelect).toHaveBeenCalledTimes(3);
    });

    it("삭제 버튼을 여러 번 클릭해도 올바르게 처리되어야 한다", () => {
      const mockOnRemove = vi.fn();
      renderWithTheme({ onRemove: mockOnRemove });

      const deleteButton = screen.getByRole("button", {
        name: /커스텀 블루 색상 삭제/,
      });

      // 여러 번 클릭
      fireEvent.click(deleteButton);
      fireEvent.click(deleteButton);

      expect(mockOnRemove).toHaveBeenCalledTimes(2);
    });
  });
});
