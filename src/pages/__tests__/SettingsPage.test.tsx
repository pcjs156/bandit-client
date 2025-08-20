import { screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { render } from "@src/test/helpers/testUtils";
import SettingsPage from "../SettingsPage";

// Mock ThemeSection component
vi.mock("@src/components/settings/ThemeSection", () => ({
  default: () => <div data-testid="theme-section">ThemeSection</div>,
}));

// Mock PrimaryColorSection component
vi.mock("@src/components/settings/PrimaryColorSection", () => ({
  default: () => (
    <div data-testid="primary-color-section">PrimaryColorSection</div>
  ),
}));

const renderSettingsPage = () => {
  return render(<SettingsPage />);
};

describe("SettingsPage", () => {
  describe("렌더링", () => {
    it("설정 페이지가 올바르게 렌더링되어야 한다", () => {
      renderSettingsPage();

      expect(screen.getByRole("heading", { name: "설정" })).toBeInTheDocument();
      expect(screen.getByTestId("theme-section")).toBeInTheDocument();
      expect(screen.getByTestId("primary-color-section")).toBeInTheDocument();
    });

    it("페이지 제목이 올바르게 표시되어야 한다", () => {
      renderSettingsPage();

      const title = screen.getByRole("heading", { name: "설정" });
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe("H1");
    });
  });

  describe("구조", () => {
    it("ThemeSection과 PrimaryColorSection이 올바른 순서로 렌더링되어야 한다", () => {
      renderSettingsPage();

      const themeSection = screen.getByTestId("theme-section");
      const primaryColorSection = screen.getByTestId("primary-color-section");

      expect(themeSection).toBeInTheDocument();
      expect(primaryColorSection).toBeInTheDocument();
    });

    it("Mantine Container가 올바른 크기와 패딩을 가져야 한다", () => {
      renderSettingsPage();

      const container = document.querySelector('[data-size="md"]');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute("data-size", "md");
    });
  });

  describe("컴포넌트 구성", () => {
    it("ThemeSection 컴포넌트가 렌더링되어야 한다", () => {
      renderSettingsPage();

      expect(screen.getByTestId("theme-section")).toBeInTheDocument();
    });

    it("PrimaryColorSection 컴포넌트가 렌더링되어야 한다", () => {
      renderSettingsPage();

      expect(screen.getByTestId("primary-color-section")).toBeInTheDocument();
    });
  });
});
