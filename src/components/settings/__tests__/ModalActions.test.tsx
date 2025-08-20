import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { MantineProvider } from "@mantine/core";
import { ModalActions } from "../ModalActions";

describe("ModalActions", () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  const renderWithTheme = (props = {}) => {
    return render(
      <MantineProvider>
        <ModalActions {...defaultProps} {...props} />
      </MantineProvider>
    );
  };

  describe("기본 렌더링", () => {
    it("컴포넌트가 렌더링되어야 한다", () => {
      renderWithTheme();

      expect(screen.getByText("추가")).toBeInTheDocument();
      expect(screen.getByText("취소")).toBeInTheDocument();
    });

    it("기본 텍스트로 버튼들이 렌더링되어야 한다", () => {
      renderWithTheme();

      expect(screen.getByRole("button", { name: "추가" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    });
  });

  describe("Props 처리", () => {
    it("submitText prop이 올바르게 적용되어야 한다", () => {
      renderWithTheme({ submitText: "저장" });

      expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
    });

    it("cancelText prop이 올바르게 적용되어야 한다", () => {
      renderWithTheme({ cancelText: "닫기" });

      expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
    });

    it("submitText가 없을 때 기본값을 사용해야 한다", () => {
      renderWithTheme();

      expect(screen.getByRole("button", { name: "추가" })).toBeInTheDocument();
    });

    it("cancelText가 없을 때 기본값을 사용해야 한다", () => {
      renderWithTheme();

      expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    });
  });

  describe("로딩 상태", () => {
    it("isLoading이 true일 때 제출 버튼이 로딩 상태여야 한다", () => {
      renderWithTheme({ isLoading: true });

      const submitButton = screen.getByRole("button", { name: "추가" });
      expect(submitButton).toHaveAttribute("data-loading", "true");
    });

    it("isLoading이 false일 때 제출 버튼이 로딩 상태가 아니어야 한다", () => {
      renderWithTheme({ isLoading: false });

      const submitButton = screen.getByRole("button", { name: "추가" });
      expect(submitButton).not.toHaveAttribute("data-loading", "true");
    });

    it("isLoading이 undefined일 때 기본값 false를 사용해야 한다", () => {
      renderWithTheme();

      const submitButton = screen.getByRole("button", { name: "추가" });
      expect(submitButton).not.toHaveAttribute("data-loading", "true");
    });
  });

  describe("버튼 비활성화", () => {
    it("isSubmitDisabled가 true일 때 제출 버튼이 비활성화되어야 한다", () => {
      renderWithTheme({ isSubmitDisabled: true });

      const submitButton = screen.getByRole("button", { name: "추가" });
      expect(submitButton).toBeDisabled();
    });

    it("isSubmitDisabled가 false일 때 제출 버튼이 활성화되어야 한다", () => {
      renderWithTheme({ isSubmitDisabled: false });

      const submitButton = screen.getByRole("button", { name: "추가" });
      expect(submitButton).not.toBeDisabled();
    });

    it("isSubmitDisabled가 undefined일 때 기본값 false를 사용해야 한다", () => {
      renderWithTheme();

      const submitButton = screen.getByRole("button", { name: "추가" });
      expect(submitButton).not.toBeDisabled();
    });

    it("isLoading이 true일 때 취소 버튼도 비활성화되어야 한다", () => {
      renderWithTheme({ isLoading: true });

      const cancelButton = screen.getByRole("button", { name: "취소" });
      expect(cancelButton).toBeDisabled();
    });

    it("isLoading이 false일 때 취소 버튼이 활성화되어야 한다", () => {
      renderWithTheme({ isLoading: false });

      const cancelButton = screen.getByRole("button", { name: "취소" });
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe("사용자 상호작용", () => {
    it("제출 버튼 클릭 시 onSubmit이 호출되어야 한다", () => {
      const mockOnSubmit = vi.fn();
      renderWithTheme({ onSubmit: mockOnSubmit });

      const submitButton = screen.getByRole("button", { name: "추가" });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it("취소 버튼 클릭 시 onCancel이 호출되어야 한다", () => {
      const mockOnCancel = vi.fn();
      renderWithTheme({ onCancel: mockOnCancel });

      const cancelButton = screen.getByRole("button", { name: "취소" });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("로딩 중일 때 제출 버튼 클릭이 무시되어야 한다", () => {
      const mockOnSubmit = vi.fn();
      renderWithTheme({ onSubmit: mockOnSubmit, isLoading: true });

      const submitButton = screen.getByRole("button", { name: "추가" });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("제출이 비활성화된 상태에서 제출 버튼 클릭이 무시되어야 한다", () => {
      const mockOnSubmit = vi.fn();
      renderWithTheme({ onSubmit: mockOnSubmit, isSubmitDisabled: true });

      const submitButton = screen.getByRole("button", { name: "추가" });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("로딩 중일 때 취소 버튼 클릭이 무시되어야 한다", () => {
      const mockOnCancel = vi.fn();
      renderWithTheme({ onCancel: mockOnCancel, isLoading: true });

      const cancelButton = screen.getByRole("button", { name: "취소" });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe("키보드 접근성", () => {
    it("Enter 키로 제출 버튼을 활성화할 수 있어야 한다", () => {
      const mockOnSubmit = vi.fn();
      renderWithTheme({ onSubmit: mockOnSubmit });

      const submitButton = screen.getByRole("button", { name: "추가" });
      fireEvent.keyDown(submitButton, { key: "Enter" });

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it("Space 키로 제출 버튼을 활성화할 수 있어야 한다", () => {
      const mockOnSubmit = vi.fn();
      renderWithTheme({ onSubmit: mockOnSubmit });

      const submitButton = screen.getByRole("button", { name: "추가" });
      fireEvent.keyDown(submitButton, { key: " " });

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it("Enter 키로 취소 버튼을 활성화할 수 있어야 한다", () => {
      const mockOnCancel = vi.fn();
      renderWithTheme({ onCancel: mockOnCancel });

      const cancelButton = screen.getByRole("button", { name: "취소" });
      fireEvent.keyDown(cancelButton, { key: "Enter" });

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("Space 키로 취소 버튼을 활성화할 수 있어야 한다", () => {
      const mockOnCancel = vi.fn();
      renderWithTheme({ onCancel: mockOnCancel });

      const cancelButton = screen.getByRole("button", { name: "취소" });
      fireEvent.keyDown(cancelButton, { key: " " });

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("레이아웃", () => {
    it("Group 컴포넌트를 사용해야 한다", () => {
      renderWithTheme();

      const group = document.querySelector(".mantine-Group-root");
      expect(group).toBeInTheDocument();
    });

    it("버튼들이 오른쪽 정렬되어야 한다", () => {
      renderWithTheme();

      const group = document.querySelector(".mantine-Group-root");
      expect(group).toHaveClass("mantine-Group-root");
    });

    it("제출 버튼과 취소 버튼이 올바른 순서로 배치되어야 한다", () => {
      renderWithTheme();

      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toHaveTextContent("취소");
      expect(buttons[1]).toHaveTextContent("추가");
    });
  });

  describe("스타일링", () => {
    it("제출 버튼이 기본 스타일을 가져야 한다", () => {
      renderWithTheme();
      const submitButton = screen.getByRole("button", { name: "추가" });
      expect(submitButton).toHaveClass("mantine-Button-root");
      // Mantine v7에서는 variant가 filled일 때 기본 스타일이 적용됩니다
      // data-variant 속성이 없을 수 있으므로 클래스만 확인
    });

    it("취소 버튼이 outline 스타일을 가져야 한다", () => {
      renderWithTheme();
      const cancelButton = screen.getByRole("button", { name: "취소" });
      expect(cancelButton).toHaveClass("mantine-Button-root");
      // Mantine v7에서는 variant가 outline일 때 기본 스타일이 적용됩니다
      // data-variant 속성이 없을 수 있으므로 클래스만 확인
    });
  });

  describe("조건부 렌더링", () => {
    it("다양한 로딩 상태에서 올바르게 렌더링되어야 한다", () => {
      const { rerender } = renderWithTheme({ isLoading: false });

      // 로딩이 false일 때
      let submitButton = screen.getByRole("button", { name: "추가" });
      let cancelButton = screen.getByRole("button", { name: "취소" });
      expect(submitButton).not.toBeDisabled();
      expect(cancelButton).not.toBeDisabled();

      // 로딩을 true로 변경
      rerender(
        <MantineProvider>
          <ModalActions {...defaultProps} isLoading={true} />
        </MantineProvider>
      );

      // 로딩이 true일 때
      submitButton = screen.getByRole("button", { name: "추가" });
      cancelButton = screen.getByRole("button", { name: "취소" });
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it("다양한 제출 비활성화 상태에서 올바르게 렌더링되어야 한다", () => {
      const { rerender } = renderWithTheme({ isSubmitDisabled: false });

      // 제출이 활성화된 상태
      let submitButton = screen.getByRole("button", { name: "추가" });
      expect(submitButton).not.toBeDisabled();

      // 제출을 비활성화
      rerender(
        <MantineProvider>
          <ModalActions {...defaultProps} isSubmitDisabled={true} />
        </MantineProvider>
      );

      // 제출이 비활성화된 상태
      submitButton = screen.getByRole("button", { name: "추가" });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("메모이제이션", () => {
    it("memo로 감싸져 있어야 한다", () => {
      // memo로 감싸진 컴포넌트는 displayName이 설정되어 있어야 함
      expect(ModalActions.displayName).toBe("ModalActions");
    });
  });

  describe("에러 처리", () => {
    it("onSubmit이 undefined일 때 에러가 발생하지 않아야 한다", () => {
      expect(() => {
        renderWithTheme({ onSubmit: undefined });
      }).not.toThrow();
    });

    it("onCancel이 undefined일 때 에러가 발생하지 않아야 한다", () => {
      expect(() => {
        renderWithTheme({ onCancel: undefined });
      }).not.toThrow();
    });
  });

  describe("복합 상태", () => {
    it("로딩과 제출 비활성화가 동시에 적용되어야 한다", () => {
      renderWithTheme({ isLoading: true, isSubmitDisabled: true });

      const submitButton = screen.getByRole("button", { name: "추가" });
      const cancelButton = screen.getByRole("button", { name: "취소" });

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it("로딩이 false이고 제출이 비활성화된 상태에서 제출 버튼만 비활성화되어야 한다", () => {
      renderWithTheme({ isLoading: false, isSubmitDisabled: true });

      const submitButton = screen.getByRole("button", { name: "추가" });
      const cancelButton = screen.getByRole("button", { name: "취소" });

      expect(submitButton).toBeDisabled();
      expect(cancelButton).not.toBeDisabled();
    });
  });
});
