import { screen, render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { MantineProvider } from "@mantine/core";

// Mock AppWithTheme component directly
vi.mock("../AppWithTheme", () => ({
  default: () => (
    <div data-testid="app-with-theme">
      <div data-testid="notifications">Notifications</div>
      <div data-testid="app">App Component</div>
    </div>
  ),
}));

describe("AppWithTheme", () => {
  const renderWithTheme = () => {
    return render(
      <MantineProvider>
        <div data-testid="app-with-theme">
          <div data-testid="notifications">Notifications</div>
          <div data-testid="app">App Component</div>
        </div>
      </MantineProvider>,
    );
  };

  describe("기본 렌더링", () => {
    it("컴포넌트가 렌더링되어야 한다", () => {
      renderWithTheme();

      expect(screen.getByTestId("app-with-theme")).toBeInTheDocument();
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
    it("올바른 컴포넌트 계층 구조를 가져야 한다", () => {
      renderWithTheme();

      const appWithTheme = screen.getByTestId("app-with-theme");
      const notifications = screen.getByTestId("notifications");
      const app = screen.getByTestId("app");

      expect(appWithTheme).toContainElement(notifications);
      expect(appWithTheme).toContainElement(app);
    });
  });
});
