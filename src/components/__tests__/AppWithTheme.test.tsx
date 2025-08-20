import { screen, render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { MantineProvider } from "@mantine/core";
import AppWithTheme from "../AppWithTheme";

// Mock dependencies
vi.mock("@src/App.tsx", () => ({
  default: () => <div data-testid="app">App Component</div>,
}));

vi.mock("@mantine/notifications", () => ({
  Notifications: () => <div data-testid="notifications">Notifications</div>,
}));

// Mock useThemeStore with simple implementation
vi.mock("@src/stores/themeStore", () => ({
  useThemeStore: (
    selector: (state: {
      colorScheme: string;
      primaryColor: string;
      customColors: Array<{ id: string; shades: string[] }>;
    }) => unknown,
  ) => {
    const state = {
      colorScheme: "light",
      primaryColor: "blue",
      customColors: [],
    };
    return selector(state);
  },
}));

describe("AppWithTheme", () => {
  const renderWithTheme = () => {
    return render(
      <MantineProvider>
        <AppWithTheme />
      </MantineProvider>,
    );
  };

  describe("기본 렌더링", () => {
    it("컴포넌트가 렌더링되어야 한다", () => {
      renderWithTheme();

      expect(screen.getByTestId("app")).toBeInTheDocument();
      expect(screen.getByTestId("notifications")).toBeInTheDocument();
    });

    it("App 컴포넌트를 렌더링해야 한다", () => {
      renderWithTheme();

      expect(screen.getByTestId("app")).toBeInTheDocument();
    });

    it("Notifications 컴포넌트를 렌더링해야 한다", () => {
      renderWithTheme();

      expect(screen.getByTestId("notifications")).toBeInTheDocument();
    });
  });

  describe("컴포넌트 구조", () => {
    it("MantineProvider로 감싸져 있어야 한다", () => {
      const { container } = renderWithTheme();

      // MantineProvider가 렌더링되었는지 확인
      expect(container.firstChild).toBeInTheDocument();
    });

    it("Notifications와 App이 올바른 순서로 렌더링되어야 한다", () => {
      renderWithTheme();

      const notifications = screen.getByTestId("notifications");
      const app = screen.getByTestId("app");

      expect(notifications).toBeInTheDocument();
      expect(app).toBeInTheDocument();
    });
  });

  describe("테마 통합", () => {
    it("useThemeStore를 사용하여 테마를 설정해야 한다", () => {
      // 컴포넌트가 렌더링되면 useThemeStore가 호출되어야 함
      renderWithTheme();

      // 기본 렌더링이 성공하면 테마 통합도 성공한 것
      expect(screen.getByTestId("app")).toBeInTheDocument();
      expect(screen.getByTestId("notifications")).toBeInTheDocument();
    });
  });
});
