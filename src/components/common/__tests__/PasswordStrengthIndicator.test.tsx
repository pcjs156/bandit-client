import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import PasswordStrengthIndicator from "../PasswordStrengthIndicator";

describe("PasswordStrengthIndicator", () => {
  const renderWithTheme = (props: { password: string; strength?: number }) => {
    return render(
      <MantineProvider>
        <PasswordStrengthIndicator {...props} />
      </MantineProvider>,
    );
  };

  describe("기본 렌더링", () => {
    it("컴포넌트가 렌더링되어야 한다", () => {
      renderWithTheme({ password: "test" });

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.getByText(/비밀번호 강도:/)).toBeInTheDocument();
    });

    it("password가 빈 문자열일 때 early return해야 한다", () => {
      renderWithTheme({ password: "" });

      // 빈 문자열일 때는 아무것도 렌더링하지 않음
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.queryByText(/비밀번호 강도:/)).not.toBeInTheDocument();
    });
  });

  describe("Progress 컴포넌트", () => {
    it("Progress 컴포넌트가 올바르게 렌더링되어야 한다", () => {
      renderWithTheme({ password: "test" });

      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();
    });

    it("Progress 컴포넌트가 올바른 기본값을 가져야 한다", () => {
      renderWithTheme({ password: "test" });

      const progress = screen.getByRole("progressbar");
      // Mantine Progress 컴포넌트의 기본값
      expect(progress).toHaveAttribute("aria-valuemax", "100");
      expect(progress).toHaveAttribute("aria-valuemin", "0");
    });

    it("password에 따라 strength 값이 계산되어야 한다", () => {
      renderWithTheme({ password: "test" });

      const progress = screen.getByRole("progressbar");
      // usePasswordStrength 훅에서 계산된 값이 있어야 함
      expect(progress).toHaveAttribute("aria-valuenow");
      const value = progress.getAttribute("aria-valuenow");
      expect(parseInt(value || "0")).toBeGreaterThanOrEqual(0);
      expect(parseInt(value || "0")).toBeLessThanOrEqual(100);
    });
  });

  describe("비밀번호 강도 계산", () => {
    it("짧은 비밀번호는 낮은 강도를 가져야 한다", () => {
      renderWithTheme({ password: "a" });

      const progress = screen.getByRole("progressbar");
      const value = progress.getAttribute("aria-valuenow");
      expect(parseInt(value || "0")).toBeLessThan(30);
    });

    it("8자 이상 비밀번호는 길이 점수를 가져야 한다", () => {
      renderWithTheme({ password: "abcdefgh" });

      const progress = screen.getByRole("progressbar");
      const value = progress.getAttribute("aria-valuenow");
      expect(parseInt(value || "0")).toBeGreaterThanOrEqual(25);
    });

    it("12자 이상 비밀번호는 추가 길이 점수를 가져야 한다", () => {
      renderWithTheme({ password: "abcdefghijkl" });

      const progress = screen.getByRole("progressbar");
      const value = progress.getAttribute("aria-valuenow");
      expect(parseInt(value || "0")).toBeGreaterThanOrEqual(50);
    });

    it("대문자가 포함된 비밀번호는 추가 점수를 가져야 한다", () => {
      renderWithTheme({ password: "abcdefgH" });

      const progress = screen.getByRole("progressbar");
      const value = progress.getAttribute("aria-valuenow");
      expect(parseInt(value || "0")).toBeGreaterThanOrEqual(50);
    });

    it("소문자가 포함된 비밀번호는 추가 점수를 가져야 한다", () => {
      renderWithTheme({ password: "ABCDEFGh" });

      const progress = screen.getByRole("progressbar");
      const value = progress.getAttribute("aria-valuenow");
      expect(parseInt(value || "0")).toBeGreaterThanOrEqual(50);
    });

    it("숫자가 포함된 비밀번호는 추가 점수를 가져야 한다", () => {
      renderWithTheme({ password: "abcdefg1" });

      const progress = screen.getByRole("progressbar");
      const value = progress.getAttribute("aria-valuenow");
      expect(parseInt(value || "0")).toBeGreaterThanOrEqual(50);
    });

    it("특수문자가 포함된 비밀번호는 추가 점수를 가져야 한다", () => {
      renderWithTheme({ password: "abcdefg@" });

      const progress = screen.getByRole("progressbar");
      const value = progress.getAttribute("aria-valuenow");
      expect(parseInt(value || "0")).toBeGreaterThanOrEqual(50);
    });
  });

  describe("색상 및 라벨", () => {
    it("약한 비밀번호는 적절한 라벨을 가져야 한다", () => {
      renderWithTheme({ password: "a" });

      expect(screen.getByText("비밀번호 강도: 약함")).toBeInTheDocument();
    });

    it("보통 비밀번호는 적절한 라벨을 가져야 한다", () => {
      renderWithTheme({ password: "abcdefgh" });

      expect(screen.getByText("비밀번호 강도: 보통")).toBeInTheDocument();
    });

    it("강한 비밀번호는 적절한 라벨을 가져야 한다", () => {
      renderWithTheme({ password: "abcdefghijkl" });

      expect(screen.getByText("비밀번호 강도: 강함")).toBeInTheDocument();
    });

    it("매우 강한 비밀번호는 적절한 라벨을 가져야 한다", () => {
      renderWithTheme({ password: "Abcdefghijkl1@" });

      expect(screen.getByText("비밀번호 강도: 매우 강함")).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("올바른 role을 가져야 한다", () => {
      renderWithTheme({ password: "test" });

      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();
    });

    it("Progress 컴포넌트의 기본 접근성 속성을 가져야 한다", () => {
      renderWithTheme({ password: "test" });

      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuemax");
      expect(progress).toHaveAttribute("aria-valuemin");
      expect(progress).toHaveAttribute("aria-valuenow");
    });
  });

  describe("경계값 테스트", () => {
    it("매우 긴 password에서도 작동해야 한다", () => {
      const longPassword = "a".repeat(1000);
      renderWithTheme({ password: longPassword });

      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();
    });

    it("특수문자만으로 구성된 비밀번호도 처리되어야 한다", () => {
      renderWithTheme({ password: "!@#$%^&*()" });

      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();
    });

    it("숫자만으로 구성된 비밀번호도 처리되어야 한다", () => {
      renderWithTheme({ password: "123456789" });

      const progress = screen.getByRole("progressbar");
      expect(progress).toBeInTheDocument();
    });
  });

  describe("Props 검증", () => {
    it("password prop이 올바르게 전달되어야 한다", () => {
      const testPassword = "testPassword123";
      renderWithTheme({ password: testPassword });

      // password prop이 컴포넌트 내부에서 사용되는지 확인
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.getByText(/비밀번호 강도:/)).toBeInTheDocument();
    });

    it("다양한 password 값에서 올바르게 작동해야 한다", () => {
      const testCases = [
        "a",
        "ab",
        "abc",
        "abcd",
        "abcde",
        "abcdef",
        "abcdefg",
        "abcdefgh",
        "abcdefghi",
        "abcdefghij",
        "abcdefghijk",
        "abcdefghijkl",
      ];

      testCases.forEach((password) => {
        const { unmount } = renderWithTheme({ password });

        const progress = screen.getByRole("progressbar");
        expect(progress).toBeInTheDocument();

        unmount();
      });
    });
  });
});
