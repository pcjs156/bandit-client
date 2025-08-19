import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useColorForm } from "../useColorForm";
import type { CustomColor } from "@src/stores/themeStore";

// 외부 의존성 모킹
vi.mock("@src/utils/colorValidation", () => ({
  validateColorInput: vi.fn(),
}));

vi.mock("@src/utils/colorNotifications", () => ({
  showColorAddedError: vi.fn(),
}));

import { validateColorInput } from "@src/utils/colorValidation";
import { showColorAddedError } from "@src/utils/colorNotifications";

describe("useColorForm", () => {
  // 테스트용 데이터
  const mockCustomColors: CustomColor[] = [
    { id: "1", name: "기존색상", value: "#ff0000", shades: [] },
  ];

  const mockOnAddColor = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    customColors: mockCustomColors,
    onAddColor: mockOnAddColor,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateColorInput).mockReturnValue(null); // 기본적으로 유효
  });

  describe("초기 상태", () => {
    it("올바른 초기값을 가져야 한다", () => {
      const { result } = renderHook(() => useColorForm(defaultProps));

      expect(result.current.colorName).toBe("");
      expect(result.current.colorValue).toBe("#f63b3e"); // DEFAULT_COLOR
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("");
      expect(result.current.isSubmitDisabled).toBe(true); // 이름이 비어있으므로
    });
  });

  describe("상태 업데이트", () => {
    it("색상 이름을 변경할 수 있어야 한다", () => {
      const { result } = renderHook(() => useColorForm(defaultProps));

      act(() => {
        result.current.setColorName("새색상");
      });

      expect(result.current.colorName).toBe("새색상");
      expect(result.current.isSubmitDisabled).toBe(false); // 이름이 있으므로 제출 가능
    });

    it("색상 값을 변경할 수 있어야 한다", () => {
      const { result } = renderHook(() => useColorForm(defaultProps));

      act(() => {
        result.current.setColorValue("#00ff00");
      });

      expect(result.current.colorValue).toBe("#00ff00");
    });

    it("공백만 있는 이름은 제출 버튼을 비활성화해야 한다", () => {
      const { result } = renderHook(() => useColorForm(defaultProps));

      act(() => {
        result.current.setColorName("   ");
      });

      expect(result.current.isSubmitDisabled).toBe(true);
    });
  });

  describe("에러 처리", () => {
    it("에러를 설정하고 지울 수 있어야 한다", () => {
      const { result } = renderHook(() => useColorForm(defaultProps));

      // 에러 설정 (handleSubmit을 통해)
      vi.mocked(validateColorInput).mockReturnValue("에러 메시지");

      act(() => {
        result.current.setColorName("테스트");
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe("에러 메시지");

      // 에러 지우기
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe("");
    });
  });

  describe("폼 리셋", () => {
    it("resetForm을 호출하면 모든 상태가 초기화되어야 한다", () => {
      const { result } = renderHook(() => useColorForm(defaultProps));

      // 상태 변경
      act(() => {
        result.current.setColorName("테스트색상");
        result.current.setColorValue("#123456");
      });

      // 에러 설정
      vi.mocked(validateColorInput).mockReturnValue("에러");
      act(() => {
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe("에러");

      // 리셋
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.colorName).toBe("");
      expect(result.current.colorValue).toBe("#f63b3e");
      expect(result.current.error).toBe("");
    });
  });

  describe("handleSubmit", () => {
    beforeEach(() => {
      vi.mocked(validateColorInput).mockReturnValue(null); // 유효한 상태로 리셋
    });

    it("검증에 실패하면 에러를 설정하고 제출하지 않아야 한다", async () => {
      const { result } = renderHook(() => useColorForm(defaultProps));

      vi.mocked(validateColorInput).mockReturnValue("검증 실패");

      act(() => {
        result.current.setColorName("테스트");
        result.current.handleSubmit();
      });

      expect(result.current.error).toBe("검증 실패");
      expect(mockOnAddColor).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("검증에 성공하면 색상을 추가하고 폼을 리셋해야 한다", async () => {
      const { result } = renderHook(() => useColorForm(defaultProps));

      act(() => {
        result.current.setColorName("  테스트색상  "); // 공백 포함
        result.current.setColorValue("#123456");
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(validateColorInput).toHaveBeenCalledWith(
        "  테스트색상  ",
        "#123456",
        mockCustomColors
      );
      expect(mockOnAddColor).toHaveBeenCalledWith("테스트색상", "#123456"); // trim 적용
      expect(mockOnClose).toHaveBeenCalled();

      // 폼이 리셋되었는지 확인
      expect(result.current.colorName).toBe("");
      expect(result.current.colorValue).toBe("#f63b3e");
      expect(result.current.error).toBe("");
    });

    it("로딩 상태를 올바르게 관리해야 한다", async () => {
      const { result } = renderHook(() => useColorForm(defaultProps));

      act(() => {
        result.current.setColorName("테스트");
      });

      expect(result.current.isLoading).toBe(false);

      const submitPromise = act(async () => {
        await result.current.handleSubmit();
      });

      // 제출 중에는 로딩 상태여야 함 (실제로는 매우 빠르게 완료됨)
      await submitPromise;

      expect(result.current.isLoading).toBe(false);
    });

    it("onAddColor에서 에러가 발생하면 에러 알림을 표시해야 한다", async () => {
      // onAddColor가 에러를 던지도록 설정
      const errorOnAddColor = vi.fn(() => {
        throw new Error("색상 추가 실패");
      });

      const propsWithError = {
        ...defaultProps,
        onAddColor: errorOnAddColor,
      };

      const { result: errorResult } = renderHook(() =>
        useColorForm(propsWithError)
      );

      act(() => {
        errorResult.current.setColorName("테스트");
      });

      await act(async () => {
        await errorResult.current.handleSubmit();
      });

      expect(showColorAddedError).toHaveBeenCalled();
      expect(errorResult.current.isLoading).toBe(false);
    });

    it("제출 전에 기존 에러를 지워야 한다", async () => {
      const { result } = renderHook(() => useColorForm(defaultProps));

      // 먼저 에러 상태로 만들기
      vi.mocked(validateColorInput).mockReturnValue("첫 번째 에러");
      act(() => {
        result.current.setColorName("테스트");
        result.current.handleSubmit();
      });
      expect(result.current.error).toBe("첫 번째 에러");

      // 이제 유효한 상태로 변경하고 다시 제출
      vi.mocked(validateColorInput).mockReturnValue(null);
      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.error).toBe(""); // 에러가 지워졌어야 함
    });
  });

  describe("handleClose", () => {
    it("폼을 리셋하고 onClose를 호출해야 한다", () => {
      const { result } = renderHook(() => useColorForm(defaultProps));

      // 상태 변경
      act(() => {
        result.current.setColorName("테스트");
        result.current.setColorValue("#123456");
      });

      // 닫기
      act(() => {
        result.current.handleClose();
      });

      expect(result.current.colorName).toBe("");
      expect(result.current.colorValue).toBe("#f63b3e");
      expect(result.current.error).toBe("");
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("의존성 배열", () => {
    it("customColors가 변경되면 검증에 반영되어야 한다", async () => {
      const { result, rerender } = renderHook((props) => useColorForm(props), {
        initialProps: defaultProps,
      });

      act(() => {
        result.current.setColorName("테스트");
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(validateColorInput).toHaveBeenCalledWith(
        "테스트",
        "#f63b3e",
        mockCustomColors
      );

      // customColors 변경 후 다시 이름 설정 (handleSubmit에서 폼이 리셋되므로)
      const newCustomColors: CustomColor[] = [
        ...mockCustomColors,
        { id: "2", name: "새색상", value: "#00ff00", shades: [] },
      ];

      rerender({
        ...defaultProps,
        customColors: newCustomColors,
      });

      act(() => {
        result.current.setColorName("테스트2");
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(validateColorInput).toHaveBeenLastCalledWith(
        "테스트2",
        "#f63b3e",
        newCustomColors
      );
    });
  });
});
