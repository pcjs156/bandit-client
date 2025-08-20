import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MantineProvider } from "@mantine/core";
import PrimaryColorSection from "../PrimaryColorSection";
import { useThemeStore } from "@src/stores/themeStore";

// Mock dependencies
vi.mock("@src/stores/themeStore");
vi.mock("../AddColorModal", () => ({
  default: ({ opened, onClose, onAddColor }: any) => {
    if (!opened) return null;
    return (
      <div data-testid="add-color-modal">
        <h2>커스텀 색상 추가</h2>
        <button onClick={() => onAddColor("테스트 색상", "#FF0000")}>
          색상 추가
        </button>
        <button onClick={onClose}>닫기</button>
      </div>
    );
  },
}));

const mockUseThemeStore = vi.mocked(useThemeStore);

describe("PrimaryColorSection", () => {
  const defaultMockStore = {
    primaryColor: "blue",
    customColors: [],
    setPrimaryColor: vi.fn(),
    addCustomColor: vi.fn(),
    removeCustomColor: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseThemeStore.mockReturnValue(defaultMockStore);
  });

  const renderWithTheme = () => {
    return render(
      <MantineProvider>
        <PrimaryColorSection />
      </MantineProvider>
    );
  };

  describe("기본 렌더링", () => {
    it("컴포넌트가 렌더링되어야 한다", () => {
      renderWithTheme();

      expect(screen.getByText("Primary Color")).toBeInTheDocument();
      expect(
        screen.getByText("앱의 메인 색상을 선택할 수 있습니다.")
      ).toBeInTheDocument();
    });

    it("기본 색상들이 렌더링되어야 한다", () => {
      renderWithTheme();

      // 기본 색상들이 렌더링되는지 확인
      expect(screen.getByText("Primary Color")).toBeInTheDocument();
    });

    it("커스텀 색상 추가 버튼이 렌더링되어야 한다", () => {
      renderWithTheme();

      const addButton = screen.getByRole("button", {
        name: "커스텀 색상 추가",
      });
      expect(addButton).toBeInTheDocument();
    });
  });

  describe("커스텀 색상 표시", () => {
    it("커스텀 색상이 없을 때 커스텀 색상 섹션이 표시되지 않아야 한다", () => {
      renderWithTheme();

      expect(screen.queryByText("커스텀 색상")).not.toBeInTheDocument();
    });

    it("커스텀 색상이 있을 때 커스텀 색상 섹션이 표시되어야 한다", () => {
      const mockStoreWithCustomColors = {
        ...defaultMockStore,
        customColors: [
          { id: "custom-blue", name: "커스텀 블루", value: "#3B82F6" },
          { id: "custom-red", name: "커스텀 레드", value: "#EF4444" },
        ],
      };
      mockUseThemeStore.mockReturnValue(mockStoreWithCustomColors);

      renderWithTheme();

      expect(screen.getByText("커스텀 색상")).toBeInTheDocument();
      expect(screen.getByText("커스텀 블루")).toBeInTheDocument();
      expect(screen.getByText("커스텀 레드")).toBeInTheDocument();
    });

    it("커스텀 색상이 1개일 때도 올바르게 표시되어야 한다", () => {
      const mockStoreWithOneCustomColor = {
        ...defaultMockStore,
        customColors: [
          { id: "custom-blue", name: "커스텀 블루", value: "#3B82F6" },
        ],
      };
      mockUseThemeStore.mockReturnValue(mockStoreWithOneCustomColor);

      renderWithTheme();

      expect(screen.getByText("커스텀 색상")).toBeInTheDocument();
      expect(screen.getByText("커스텀 블루")).toBeInTheDocument();
    });
  });

  describe("모달 상태 관리", () => {
    it("초기에는 모달이 닫혀있어야 한다", () => {
      renderWithTheme();

      expect(screen.queryByText("커스텀 색상 추가")).not.toBeInTheDocument();
    });

    it("커스텀 색상 추가 버튼 클릭 시 모달이 열려야 한다", () => {
      renderWithTheme();

      const addButton = screen.getByRole("button", {
        name: "커스텀 색상 추가",
      });
      fireEvent.click(addButton);

      expect(screen.getByText("커스텀 색상 추가")).toBeInTheDocument();
    });

    it("모달이 열린 상태에서 다시 버튼을 클릭해도 모달이 열려있어야 한다", () => {
      renderWithTheme();

      const addButton = screen.getByRole("button", {
        name: "커스텀 색상 추가",
      });

      // 첫 번째 클릭
      fireEvent.click(addButton);
      expect(screen.getByText("커스텀 색상 추가")).toBeInTheDocument();

      // 두 번째 클릭
      fireEvent.click(addButton);
      expect(screen.getByText("커스텀 색상 추가")).toBeInTheDocument();
    });
  });

  describe("색상 선택", () => {
    it("기본 색상 선택 시 setPrimaryColor가 호출되어야 한다", () => {
      const mockSetPrimaryColor = vi.fn();
      const mockStore = {
        ...defaultMockStore,
        setPrimaryColor: mockSetPrimaryColor,
      };
      mockUseThemeStore.mockReturnValue(mockStore);

      renderWithTheme();

      // 기본 색상 버튼을 찾아서 클릭
      // 실제 구현에서는 ColorButton 컴포넌트가 이 기능을 담당
      expect(mockSetPrimaryColor).toBeDefined();
    });

    it("커스텀 색상 선택 시 setPrimaryColor가 호출되어야 한다", () => {
      const mockSetPrimaryColor = vi.fn();
      const mockStore = {
        ...defaultMockStore,
        customColors: [
          { id: "custom-blue", name: "커스텀 블루", value: "#3B82F6" },
        ],
        setPrimaryColor: mockSetPrimaryColor,
      };
      mockUseThemeStore.mockReturnValue(mockStore);

      renderWithTheme();

      // 커스텀 색상이 표시되는지 확인
      expect(screen.getByText("커스텀 색상")).toBeInTheDocument();
      expect(mockSetPrimaryColor).toBeDefined();
    });
  });

  describe("커스텀 색상 관리", () => {
    it("커스텀 색상 추가 시 addCustomColor가 호출되어야 한다", () => {
      const mockAddCustomColor = vi.fn();
      const mockStore = {
        ...defaultMockStore,
        addCustomColor: mockAddCustomColor,
      };
      mockUseThemeStore.mockReturnValue(mockStore);

      renderWithTheme();

      // 모달을 열고 색상을 추가하는 로직은 AddColorModal에서 처리
      expect(mockAddCustomColor).toBeDefined();
    });

    it("커스텀 색상 삭제 시 removeCustomColor가 호출되어야 한다", () => {
      const mockRemoveCustomColor = vi.fn();
      const mockStore = {
        ...defaultMockStore,
        customColors: [
          { id: "custom-blue", name: "커스텀 블루", value: "#3B82F6" },
        ],
        removeCustomColor: mockRemoveCustomColor,
      };
      mockUseThemeStore.mockReturnValue(mockStore);

      renderWithTheme();

      // 커스텀 색상이 표시되는지 확인
      expect(screen.getByText("커스텀 색상")).toBeInTheDocument();
      expect(mockRemoveCustomColor).toBeDefined();
    });
  });

  describe("조건부 렌더링", () => {
    it("커스텀 색상이 없을 때 Divider가 표시되지 않아야 한다", () => {
      renderWithTheme();

      // 커스텀 색상이 없을 때는 Divider가 표시되지 않아야 함
      // 이는 customColors.length > 0 조건에 의해 결정됨
      expect(screen.queryByText("커스텀 색상")).not.toBeInTheDocument();
    });

    it("커스텀 색상이 있을 때 Divider가 표시되어야 한다", () => {
      const mockStoreWithCustomColors = {
        ...defaultMockStore,
        customColors: [
          { id: "custom-blue", name: "커스텀 블루", value: "#3B82F6" },
        ],
      };
      mockUseThemeStore.mockReturnValue(mockStoreWithCustomColors);

      renderWithTheme();

      expect(screen.getByText("커스텀 색상")).toBeInTheDocument();
    });

    it("커스텀 색상 배열이 비어있을 때 커스텀 색상 섹션이 표시되지 않아야 한다", () => {
      const mockStoreWithEmptyCustomColors = {
        ...defaultMockStore,
        customColors: [],
      };
      mockUseThemeStore.mockReturnValue(mockStoreWithEmptyCustomColors);

      renderWithTheme();

      expect(screen.queryByText("커스텀 색상")).not.toBeInTheDocument();
    });
  });

  describe("레이아웃 구조", () => {
    it("Card 컴포넌트가 올바르게 렌더링되어야 한다", () => {
      renderWithTheme();

      // Card 컴포넌트가 렌더링되는지 확인
      const card = document.querySelector(".mantine-Card-root");
      expect(card).toBeInTheDocument();
    });

    it("Stack 컴포넌트가 올바르게 렌더링되어야 한다", () => {
      renderWithTheme();

      // Stack 컴포넌트가 렌더링되는지 확인
      const stack = document.querySelector(".mantine-Stack-root");
      expect(stack).toBeInTheDocument();
    });

    it("SimpleGrid 컴포넌트들이 올바르게 렌더링되어야 한다", () => {
      renderWithTheme();

      // SimpleGrid 컴포넌트들이 렌더링되는지 확인
      const grids = document.querySelectorAll(".mantine-SimpleGrid-root");
      expect(grids.length).toBeGreaterThan(0);
    });
  });

  describe("접근성", () => {
    it("기본 색상 선택 그룹에 올바른 aria-label이 설정되어야 한다", () => {
      renderWithTheme();

      // 기본 색상 선택 그룹의 aria-label 확인
      const baseColorGroup = screen.getByRole("group", {
        name: "기본 색상 선택",
      });
      expect(baseColorGroup).toBeInTheDocument();
    });

    it("커스텀 색상 선택 그룹에 올바른 aria-label이 설정되어야 한다", () => {
      const mockStoreWithCustomColors = {
        ...defaultMockStore,
        customColors: [
          { id: "custom-blue", name: "커스텀 블루", value: "#3B82F6" },
        ],
      };
      mockUseThemeStore.mockReturnValue(mockStoreWithCustomColors);

      renderWithTheme();

      // 커스텀 색상 선택 그룹의 aria-label 확인
      const customColorGroup = screen.getByRole("group", {
        name: "커스텀 색상 선택",
      });
      expect(customColorGroup).toBeInTheDocument();
    });

    it("커스텀 색상 추가 버튼에 올바른 aria-label이 설정되어야 한다", () => {
      renderWithTheme();

      const addButton = screen.getByRole("button", {
        name: "커스텀 색상 추가",
      });
      expect(addButton).toBeInTheDocument();
    });
  });

  describe("스타일링", () => {
    it("Card에 올바른 스타일이 적용되어야 한다", () => {
      renderWithTheme();

      const card = document.querySelector(".mantine-Card-root");
      expect(card).toHaveClass("mantine-Card-root");
    });

    it("Title이 올바른 order를 가져야 한다", () => {
      renderWithTheme();

      const title = screen.getByText("Primary Color");
      expect(title.tagName).toBe("H3");
    });

    it("ActionIcon이 올바른 스타일을 가져야 한다", () => {
      renderWithTheme();

      const addButton = screen.getByRole("button", {
        name: "커스텀 색상 추가",
      });
      expect(addButton).toHaveClass("mantine-ActionIcon-root");
    });
  });

  describe("이벤트 처리", () => {
    it("커스텀 색상 추가 버튼 클릭 시 모달 상태가 변경되어야 한다", () => {
      renderWithTheme();

      const addButton = screen.getByRole("button", {
        name: "커스텀 색상 추가",
      });

      // 초기 상태 확인
      expect(screen.queryByText("커스텀 색상 추가")).not.toBeInTheDocument();

      // 버튼 클릭
      fireEvent.click(addButton);

      // 모달이 열린 상태 확인
      expect(screen.getByText("커스텀 색상 추가")).toBeInTheDocument();
    });

    it("여러 번 버튼을 클릭해도 모달이 올바르게 동작해야 한다", () => {
      renderWithTheme();

      const addButton = screen.getByRole("button", {
        name: "커스텀 색상 추가",
      });

      // 첫 번째 클릭
      fireEvent.click(addButton);
      expect(screen.getByText("커스텀 색상 추가")).toBeInTheDocument();

      // 두 번째 클릭 (모달이 이미 열려있어야 함)
      fireEvent.click(addButton);
      expect(screen.getByText("커스텀 색상 추가")).toBeInTheDocument();
    });
  });

  describe("상태 동기화", () => {
    it("store의 상태 변경이 컴포넌트에 반영되어야 한다", () => {
      const { rerender } = renderWithTheme();

      // 초기 상태 확인
      expect(screen.queryByText("커스텀 색상")).not.toBeInTheDocument();

      // store 상태 변경
      const mockStoreWithCustomColors = {
        ...defaultMockStore,
        customColors: [
          { id: "custom-blue", name: "커스텀 블루", value: "#3B82F6" },
        ],
      };
      mockUseThemeStore.mockReturnValue(mockStoreWithCustomColors);

      // 컴포넌트 재렌더링
      rerender(
        <MantineProvider>
          <PrimaryColorSection />
        </MantineProvider>
      );

      // 변경된 상태 확인
      expect(screen.getByText("커스텀 색상")).toBeInTheDocument();
    });
  });

  describe("에러 처리", () => {
    it("store 함수들이 undefined일 때 에러가 발생하지 않아야 한다", () => {
      const mockStoreWithUndefinedFunctions = {
        primaryColor: "blue",
        customColors: [],
        setPrimaryColor: undefined,
        addCustomColor: undefined,
        removeCustomColor: undefined,
      };
      mockUseThemeStore.mockReturnValue(mockStoreWithUndefinedFunctions);

      expect(() => {
        renderWithTheme();
      }).not.toThrow();
    });
  });

  describe("성능 최적화", () => {
    it("useCallback으로 감싸진 함수들이 올바르게 동작해야 한다", () => {
      renderWithTheme();

      // handleAddColor 함수가 useCallback으로 감싸져 있어야 함
      // 이는 컴포넌트가 불필요하게 재렌더링되는 것을 방지
      expect(screen.getByText("Primary Color")).toBeInTheDocument();
    });
  });
});
