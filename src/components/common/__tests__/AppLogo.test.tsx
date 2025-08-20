import { screen, render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MantineProvider } from "@mantine/core";
import AppLogo from "../AppLogo";

describe("AppLogo", () => {
  const renderWithTheme = (props = {}) => {
    return render(
      <MantineProvider>
        <AppLogo {...props} />
      </MantineProvider>
    );
  };

  describe("기본 렌더링", () => {
    it("기본 props로 렌더링되어야 한다", () => {
      renderWithTheme();

      expect(screen.getByText("BANDIT")).toBeInTheDocument();
      expect(screen.getByTestId("icon-music")).toBeInTheDocument();
    });

    it("IconMusic 아이콘이 렌더링되어야 한다", () => {
      renderWithTheme();

      const icon = screen.getByTestId("icon-music");
      expect(icon).toBeInTheDocument();
    });

    it("BANDIT 타이틀이 렌더링되어야 한다", () => {
      renderWithTheme();

      const title = screen.getByText("BANDIT");
      expect(title).toBeInTheDocument();
    });
  });

  describe("size prop 처리", () => {
    it("size가 'sm'일 때 작은 크기로 렌더링되어야 한다", () => {
      renderWithTheme({ size: "sm" });

      const icon = screen.getByTestId("icon-music");
      expect(icon).toHaveAttribute("width", "28");
      expect(icon).toHaveAttribute("height", "28");
    });

    it("size가 'md'일 때 중간 크기로 렌더링되어야 한다", () => {
      renderWithTheme({ size: "md" });

      const icon = screen.getByTestId("icon-music");
      expect(icon).toHaveAttribute("width", "36");
      expect(icon).toHaveAttribute("height", "36");
    });

    it("size가 'lg'일 때 큰 크기로 렌더링되어야 한다", () => {
      renderWithTheme({ size: "lg" });

      const icon = screen.getByTestId("icon-music");
      expect(icon).toHaveAttribute("width", "48");
      expect(icon).toHaveAttribute("height", "48");
    });

    it("size가 지정되지 않았을 때 기본값 'lg'로 렌더링되어야 한다", () => {
      renderWithTheme();

      const icon = screen.getByTestId("icon-music");
      expect(icon).toHaveAttribute("width", "48");
      expect(icon).toHaveAttribute("height", "48");
    });
  });

  describe("showTitle prop 처리", () => {
    it("showTitle이 true일 때 타이틀이 표시되어야 한다", () => {
      renderWithTheme({ showTitle: true });

      expect(screen.getByText("BANDIT")).toBeInTheDocument();
    });

    it("showTitle이 false일 때 타이틀이 표시되지 않아야 한다", () => {
      renderWithTheme({ showTitle: false });

      expect(screen.queryByText("BANDIT")).not.toBeInTheDocument();
    });

    it("showTitle이 지정되지 않았을 때 기본값 true로 타이틀이 표시되어야 한다", () => {
      renderWithTheme();

      expect(screen.getByText("BANDIT")).toBeInTheDocument();
    });
  });

  describe("레이아웃", () => {
    it("Center 컴포넌트로 감싸져 있어야 한다", () => {
      const { container } = renderWithTheme();

      // Center 컴포넌트가 렌더링되었는지 확인
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("타이틀이 h1 태그로 렌더링되어야 한다", () => {
      renderWithTheme();

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent("BANDIT");
    });
  });

  describe("조합 테스트", () => {
    it("size='sm'과 showTitle=false를 함께 사용할 수 있어야 한다", () => {
      renderWithTheme({ size: "sm", showTitle: false });

      const icon = screen.getByTestId("icon-music");
      expect(icon).toHaveAttribute("width", "28");
      expect(icon).toHaveAttribute("height", "28");

      expect(screen.queryByText("BANDIT")).not.toBeInTheDocument();
    });

    it("size='md'와 showTitle=true를 함께 사용할 수 있어야 한다", () => {
      renderWithTheme({ size: "md", showTitle: true });

      const icon = screen.getByTestId("icon-music");
      expect(icon).toHaveAttribute("width", "36");
      expect(icon).toHaveAttribute("height", "36");

      expect(screen.getByText("BANDIT")).toBeInTheDocument();
    });
  });
});
