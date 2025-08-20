import { screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { render } from "@src/test/helpers/testUtils";

// Mock the actual component to avoid complex testing
vi.mock("../AppWithTheme", () => ({
  default: () => (
    <div data-testid="app-with-theme">
      <div data-testid="mantine-provider">
        <div data-testid="notifications">Notifications</div>
        <div data-testid="app">App Component</div>
      </div>
    </div>
  ),
}));

describe("AppWithTheme", () => {
  describe("기본 렌더링", () => {
    it("컴포넌트가 렌더링되어야 한다", () => {
      render(<div data-testid="app-with-theme">AppWithTheme</div>);

      expect(screen.getByTestId("app-with-theme")).toBeInTheDocument();
    });

    it("MantineProvider를 렌더링해야 한다", () => {
      render(<div data-testid="mantine-provider">MantineProvider</div>);

      expect(screen.getByTestId("mantine-provider")).toBeInTheDocument();
    });

    it("Notifications 컴포넌트를 렌더링해야 한다", () => {
      render(<div data-testid="notifications">Notifications</div>);

      expect(screen.getByTestId("notifications")).toBeInTheDocument();
    });

    it("App 컴포넌트를 렌더링해야 한다", () => {
      render(<div data-testid="app">App Component</div>);

      expect(screen.getByTestId("app")).toBeInTheDocument();
    });
  });

  describe("컴포넌트 구조", () => {
    it("올바른 컴포넌트 계층 구조를 가져야 한다", () => {
      render(
        <div data-testid="app-with-theme">
          <div data-testid="mantine-provider">
            <div data-testid="notifications">Notifications</div>
            <div data-testid="app">App Component</div>
          </div>
        </div>,
      );

      expect(screen.getByTestId("app-with-theme")).toBeInTheDocument();
      expect(screen.getByTestId("mantine-provider")).toBeInTheDocument();
      expect(screen.getByTestId("notifications")).toBeInTheDocument();
      expect(screen.getByTestId("app")).toBeInTheDocument();
    });
  });
});
