import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import App from "./App";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="router">{children}</div>
  ),
  Routes: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="routes">{children}</div>
  ),
  Route: ({
    element,
    children,
  }: {
    element: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <div data-testid="route">
      {element}
      {children}
    </div>
  ),
}));

// Mock child components
vi.mock("@src/components/common/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">
      <div data-testid="layout-children">{children}</div>
    </div>
  ),
}));

vi.mock("@src/pages/HomePage", () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock("@src/pages/SettingsPage", () => ({
  default: () => <div data-testid="settings-page">Settings Page</div>,
}));

vi.mock("@src/pages/LoginPage", () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock("@src/pages/RegisterPage", () => ({
  default: () => <div data-testid="register-page">Register Page</div>,
}));

describe("App", () => {
  const renderApp = () => {
    return render(
      <MantineProvider>
        <App />
      </MantineProvider>,
    );
  };

  describe("컴포넌트 구조", () => {
    it("Router 컴포넌트를 렌더링해야 한다", () => {
      renderApp();

      expect(screen.getByTestId("router")).toBeInTheDocument();
    });

    it("Routes 컴포넌트를 렌더링해야 한다", () => {
      renderApp();

      expect(screen.getByTestId("routes")).toBeInTheDocument();
    });

    it("모든 Route 컴포넌트를 렌더링해야 한다", () => {
      renderApp();

      const routes = screen.getAllByTestId("route");
      expect(routes).toHaveLength(5); // /, /settings, /login, /register + 중첩 route
    });
  });

  describe("페이지 컴포넌트", () => {
    it("HomePage를 렌더링해야 한다", () => {
      renderApp();

      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    it("SettingsPage를 렌더링해야 한다", () => {
      renderApp();

      expect(screen.getByTestId("settings-page")).toBeInTheDocument();
    });

    it("LoginPage를 렌더링해야 한다", () => {
      renderApp();

      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });

    it("RegisterPage를 렌더링해야 한다", () => {
      renderApp();

      expect(screen.getByTestId("register-page")).toBeInTheDocument();
    });
  });

  describe("레이아웃 구조", () => {
    it("Layout 컴포넌트를 렌더링해야 한다", () => {
      renderApp();

      expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    it("Layout 내부에 children이 렌더링되어야 한다", () => {
      renderApp();

      const layout = screen.getByTestId("layout");
      const layoutChildren = screen.getByTestId("layout-children");

      expect(layout).toContainElement(layoutChildren);
    });
  });

  describe("라우팅 구조", () => {
    it("루트 경로(/)가 정의되어야 한다", () => {
      renderApp();

      // index route가 렌더링되는지 확인
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    it("중첩 라우트가 올바르게 구성되어야 한다", () => {
      renderApp();

      // Layout과 HomePage가 모두 렌더링되는지 확인
      const layout = screen.getByTestId("layout");
      const homePage = screen.getByTestId("home-page");

      expect(layout).toBeInTheDocument();
      expect(homePage).toBeInTheDocument();
    });
  });
});
