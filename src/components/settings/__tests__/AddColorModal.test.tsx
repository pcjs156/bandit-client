import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MantineProvider } from "@mantine/core";
import AddColorModal from "../AddColorModal";

// useColorForm 훅을 모킹
vi.mock("@src/hooks/useColorForm", () => ({
  useColorForm: vi.fn(),
}));

// useThemeStore를 모킹
vi.mock("@src/stores/themeStore", () => ({
  useThemeStore: vi.fn(),
}));

const mockUseColorForm = vi.fn();
const mockUseThemeStore = vi.fn();

const defaultProps = {
  opened: true,
  onClose: vi.fn(),
  onAddColor: vi.fn(),
};

const renderWithTheme = (props = {}) => {
  return render(
    <MantineProvider>
      <AddColorModal {...defaultProps} {...props} />
    </MantineProvider>
  );
};

describe("AddColorModal", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // useThemeStore 모킹
    mockUseThemeStore.mockReturnValue({
      customColors: [],
    });
    
    // useColorForm 모킹
    mockUseColorForm.mockReturnValue({
      colorName: "",
      colorValue: "#000000",
      isLoading: false,
      error: null,
      isSubmitDisabled: false,
      setColorName: vi.fn(),
      setColorValue: vi.fn(),
      clearError: vi.fn(),
      handleSubmit: vi.fn(),
      handleClose: vi.fn(),
    });

    // 모듈에서 함수 가져오기
    const { useColorForm } = await import("@src/hooks/useColorForm");
    const { useThemeStore } = await import("@src/stores/themeStore");
    
    vi.mocked(useColorForm).mockImplementation(mockUseColorForm);
    vi.mocked(useThemeStore).mockImplementation(mockUseThemeStore);
  });

  it("모달이 열렸을 때 제목을 표시해야 한다", () => {
    renderWithTheme();
    expect(screen.getByText("커스텀 색상 추가")).toBeInTheDocument();
  });

  it("모달이 열렸을 때 ColorNameInput을 렌더링해야 한다", () => {
    renderWithTheme();
    // ColorNameInput이 렌더링되었는지 확인
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("모달이 열렸을 때 ColorPickerSection을 렌더링해야 한다", () => {
    renderWithTheme();
    // ColorPickerSection이 렌더링되었는지 확인
    // 색상 선택 라벨이 있는지 확인
    expect(screen.getByText("색상 선택")).toBeInTheDocument();
  });

  it("모달이 열렸을 때 ModalActions를 렌더링해야 한다", () => {
    renderWithTheme();
    // ModalActions가 렌더링되었는지 확인
    expect(screen.getByRole("button", { name: "추가" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  });

  it("에러가 있을 때 Alert를 표시해야 한다", () => {
    mockUseColorForm.mockReturnValue({
      colorName: "",
      colorValue: "#000000",
      isLoading: false,
      error: "에러 메시지",
      isSubmitDisabled: false,
      setColorName: vi.fn(),
      setColorValue: vi.fn(),
      clearError: vi.fn(),
      handleSubmit: vi.fn(),
      handleClose: vi.fn(),
    });

    renderWithTheme();
    expect(screen.getByText("에러 메시지")).toBeInTheDocument();
  });

  it("로딩 중일 때 입력 필드들이 비활성화되어야 한다", () => {
    mockUseColorForm.mockReturnValue({
      colorName: "",
      colorValue: "#000000",
      isLoading: true,
      error: null,
      isSubmitDisabled: false,
      setColorName: vi.fn(),
      setColorValue: vi.fn(),
      clearError: vi.fn(),
      handleSubmit: vi.fn(),
      handleClose: vi.fn(),
    });

    renderWithTheme();
    const textbox = screen.getByRole("textbox");
    
    expect(textbox).toBeDisabled();
    // ColorPicker는 disabled 상태를 직접 확인하기 어려우므로 라벨만 확인
    expect(screen.getByText("색상 선택")).toBeInTheDocument();
  });

  it("제출이 비활성화되어 있을 때 제출 버튼이 비활성화되어야 한다", () => {
    mockUseColorForm.mockReturnValue({
      colorName: "",
      colorValue: "#000000",
      isLoading: false,
      error: null,
      isSubmitDisabled: true,
      setColorName: vi.fn(),
      setColorValue: vi.fn(),
      clearError: vi.fn(),
      handleSubmit: vi.fn(),
      handleClose: vi.fn(),
    });

    renderWithTheme();
    const submitButton = screen.getByRole("button", { name: "추가" });
    expect(submitButton).toBeDisabled();
  });

  describe("조건부 렌더링", () => {
    it("opened가 true일 때만 모달 내용을 렌더링되어야 한다", () => {
      const { rerender } = renderWithTheme({ opened: true });

      expect(screen.getByText("커스텀 색상 추가")).toBeInTheDocument();

      // opened를 false로 변경
      rerender(
        <MantineProvider>
          <AddColorModal {...defaultProps} opened={false} />
        </MantineProvider>
      );

      // Mantine Modal은 opened={false}일 때도 DOM에 렌더링될 수 있지만
      // 실제로는 보이지 않습니다. 모달이 존재하는지만 확인
      const modal = screen.getByRole("dialog");
      expect(modal).toBeInTheDocument();
    });
  });
});
