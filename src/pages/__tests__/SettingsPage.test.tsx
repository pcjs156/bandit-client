import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render } from "@src/test/helpers/testUtils";
import SettingsPage from "../SettingsPage";
import { useThemeStore } from "@src/stores/themeStore";

// themeStore 모킹
vi.mock("@src/stores/themeStore");
const mockUseThemeStore = vi.mocked(useThemeStore);

// 기본 테마 스토어 상태
const defaultThemeState = {
  colorScheme: "dark" as const,
  primaryColor: "red" as const,
  customColors: [],
  toggleColorScheme: vi.fn(),
  setPrimaryColor: vi.fn(),
  addCustomColor: vi.fn(),
  removeCustomColor: vi.fn(),
};

const renderSettingsPage = () => {
  return render(<SettingsPage />);
};

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseThemeStore.mockReturnValue(defaultThemeState);
  });

  describe("렌더링", () => {
    it("설정 페이지가 올바르게 렌더링되어야 한다", () => {
      renderSettingsPage();

      expect(screen.getByRole("heading", { name: "설정" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "테마" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Primary Color" })).toBeInTheDocument();
    });

    it("페이지 제목이 올바르게 표시되어야 한다", () => {
      renderSettingsPage();

      const title = screen.getByRole("heading", { name: "설정" });
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe("H1");
    });

    it("Mantine Container가 올바른 크기와 패딩을 가져야 한다", () => {
      renderSettingsPage();

      const container = document.querySelector('[data-size="md"]');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute("data-size", "md");
    });
  });

  describe("테마 섹션", () => {
    it("테마 설명이 올바르게 표시되어야 한다", () => {
      renderSettingsPage();

      expect(
        screen.getByText("다크모드와 라이트모드를 전환할 수 있습니다.")
      ).toBeInTheDocument();
    });

    it("라이트모드와 다크모드 버튼이 모두 표시되어야 한다", () => {
      renderSettingsPage();

      expect(screen.getByRole("button", { name: "라이트모드" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "다크모드" })).toBeInTheDocument();
    });

    it("현재 다크모드일 때 라이트모드 버튼이 outline 스타일이어야 한다", () => {
      mockUseThemeStore.mockReturnValue({
        ...defaultThemeState,
        colorScheme: "dark",
      });

      renderSettingsPage();

      const lightModeButton = screen.getByRole("button", { name: "라이트모드" });
      const darkModeButton = screen.getByRole("button", { name: "다크모드" });

      expect(lightModeButton).toHaveAttribute("data-variant", "outline");
      expect(darkModeButton).toHaveAttribute("data-variant", "filled");
    });

    it("현재 라이트모드일 때 다크모드 버튼이 outline 스타일이어야 한다", () => {
      mockUseThemeStore.mockReturnValue({
        ...defaultThemeState,
        colorScheme: "light",
      });

      renderSettingsPage();

      const lightModeButton = screen.getByRole("button", { name: "라이트모드" });
      const darkModeButton = screen.getByRole("button", { name: "다크모드" });

      expect(lightModeButton).toHaveAttribute("data-variant", "filled");
      expect(darkModeButton).toHaveAttribute("data-variant", "outline");
    });

    it("라이트모드 버튼 클릭 시 toggleColorScheme이 호출되어야 한다", async () => {
      const user = userEvent.setup();
      const mockToggleColorScheme = vi.fn();
      
      mockUseThemeStore.mockReturnValue({
        ...defaultThemeState,
        colorScheme: "dark",
        toggleColorScheme: mockToggleColorScheme,
      });

      renderSettingsPage();

      const lightModeButton = screen.getByRole("button", { name: "라이트모드" });
      await user.click(lightModeButton);

      expect(mockToggleColorScheme).toHaveBeenCalledTimes(1);
    });

    it("다크모드 버튼 클릭 시 toggleColorScheme이 호출되어야 한다", async () => {
      const user = userEvent.setup();
      const mockToggleColorScheme = vi.fn();
      
      mockUseThemeStore.mockReturnValue({
        ...defaultThemeState,
        colorScheme: "light",
        toggleColorScheme: mockToggleColorScheme,
      });

      renderSettingsPage();

      const darkModeButton = screen.getByRole("button", { name: "다크모드" });
      await user.click(darkModeButton);

      expect(mockToggleColorScheme).toHaveBeenCalledTimes(1);
    });
  });

  describe("Primary Color 섹션", () => {
    it("Primary Color 설명이 올바르게 표시되어야 한다", () => {
      renderSettingsPage();

      expect(
        screen.getByText("앱의 메인 색상을 선택할 수 있습니다.")
      ).toBeInTheDocument();
    });

    it("커스텀 색상 추가 버튼이 표시되어야 한다", () => {
      renderSettingsPage();

      const addButton = screen.getByRole("button", { name: "커스텀 색상 추가" });
      expect(addButton).toBeInTheDocument();
    });

    it("기본 색상들이 그리드 형태로 표시되어야 한다", () => {
      renderSettingsPage();

      const colorGrid = screen.getByRole("group", { name: "기본 색상 선택" });
      expect(colorGrid).toBeInTheDocument();
    });

    it("커스텀 색상이 없을 때는 커스텀 색상 섹션이 표시되지 않아야 한다", () => {
      mockUseThemeStore.mockReturnValue({
        ...defaultThemeState,
        customColors: [],
      });

      renderSettingsPage();

      expect(screen.queryByText("커스텀 색상")).not.toBeInTheDocument();
    });

    it("커스텀 색상이 있을 때는 커스텀 색상 섹션이 표시되어야 한다", () => {
      const mockCustomColors = [
        {
          id: "custom-1",
          name: "테스트 색상",
          value: "#ff0000",
          shades: ["#ff0000", "#ff1111", "#ff2222"],
        },
      ];

      mockUseThemeStore.mockReturnValue({
        ...defaultThemeState,
        customColors: mockCustomColors,
      });

      renderSettingsPage();

      expect(screen.getByText("커스텀 색상")).toBeInTheDocument();
      expect(screen.getByText("테스트 색상")).toBeInTheDocument();
    });

    it("커스텀 색상 추가 버튼 클릭 시 모달이 열려야 한다", async () => {
      const user = userEvent.setup();

      renderSettingsPage();

      const addButton = screen.getByRole("button", { name: "커스텀 색상 추가" });
      await user.click(addButton);

      // 모달이 열렸는지 확인 (AddColorModal의 제목이 표시되는지)
      await waitFor(() => {
        expect(screen.getByText("커스텀 색상 추가")).toBeInTheDocument();
      });
    });
  });

  describe("사용자 상호작용", () => {
    it("색상 선택 시 setPrimaryColor가 호출되어야 한다", async () => {
      const user = userEvent.setup();
      const mockSetPrimaryColor = vi.fn();
      
      mockUseThemeStore.mockReturnValue({
        ...defaultThemeState,
        setPrimaryColor: mockSetPrimaryColor,
      });

      renderSettingsPage();

      // Red 색상 버튼을 찾아서 클릭 (현재 선택된 색상)
      const redColorButton = screen.getByRole("button", { name: "Red 색상 (현재 선택됨)" });
      await user.click(redColorButton);

      expect(mockSetPrimaryColor).toHaveBeenCalledWith("red");
    });

    it("커스텀 색상 삭제 시 removeCustomColor가 호출되어야 한다", async () => {
      const user = userEvent.setup();
      const mockRemoveCustomColor = vi.fn();
      const mockCustomColors = [
        {
          id: "custom-1",
          name: "테스트 색상",
          value: "#ff0000",
          shades: ["#ff0000", "#ff1111", "#ff2222"],
        },
      ];

      mockUseThemeStore.mockReturnValue({
        ...defaultThemeState,
        customColors: mockCustomColors,
        removeCustomColor: mockRemoveCustomColor,
      });

      renderSettingsPage();

      // 삭제 버튼을 찾아서 클릭
      const deleteButton = screen.getByRole("button", { name: /삭제/ });
      await user.click(deleteButton);

      expect(mockRemoveCustomColor).toHaveBeenCalledWith("custom-1");
    });
  });

  describe("접근성", () => {
    it("기본 색상 선택 그룹에 적절한 aria-label이 있어야 한다", () => {
      renderSettingsPage();

      expect(screen.getByRole("group", { name: "기본 색상 선택" })).toBeInTheDocument();
    });

    it("커스텀 색상이 있을 때 커스텀 색상 선택 그룹에 적절한 aria-label이 있어야 한다", () => {
      const mockCustomColors = [
        {
          id: "custom-1",
          name: "테스트 색상",
          value: "#ff0000",
          shades: ["#ff0000", "#ff1111", "#ff2222"],
        },
      ];

      mockUseThemeStore.mockReturnValue({
        ...defaultThemeState,
        customColors: mockCustomColors,
      });

      renderSettingsPage();

      expect(screen.getByRole("group", { name: "커스텀 색상 선택" })).toBeInTheDocument();
    });

    it("커스텀 색상 추가 버튼에 aria-label이 있어야 한다", () => {
      renderSettingsPage();

      const addButton = screen.getByRole("button", { name: "커스텀 색상 추가" });
      expect(addButton).toHaveAttribute("aria-label", "커스텀 색상 추가");
    });
  });
});
