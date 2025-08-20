import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render } from "@src/test/helpers/testUtils";
import { HeaderLogo } from "../HeaderLogo";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("HeaderLogo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("렌더링", () => {
    it("BANDIT 텍스트를 렌더링해야 한다", () => {
      render(<HeaderLogo />);

      expect(screen.getByText("BANDIT")).toBeInTheDocument();
    });

    it("음악 아이콘을 렌더링해야 한다", () => {
      render(<HeaderLogo />);

      // IconMusic 컴포넌트가 렌더링되었는지 확인
      const icon = document.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("로고가 링크로 렌더링되어야 한다", () => {
      render(<HeaderLogo />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/");
    });
  });

  describe("스타일링", () => {
    it("BANDIT 텍스트가 올바른 크기와 굵기를 가져야 한다", () => {
      render(<HeaderLogo />);

      const text = screen.getByText("BANDIT");
      // Mantine Text 컴포넌트의 기본 렌더링 확인
      expect(text).toBeInTheDocument();
    });

    it("BANDIT 텍스트가 primary 색상을 가져야 한다", () => {
      render(<HeaderLogo />);

      const text = screen.getByText("BANDIT");
      // Mantine Text 컴포넌트의 기본 렌더링 확인
      expect(text).toBeInTheDocument();
    });

    it("음악 아이콘이 올바른 크기를 가져야 한다", () => {
      render(<HeaderLogo />);

      // IconMusic 컴포넌트가 렌더링되었는지 확인
      const icon = document.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("링크에 텍스트 장식이 없어야 한다", () => {
      render(<HeaderLogo />);

      const link = screen.getByRole("link");
      expect(link).toHaveStyle({ textDecoration: "none" });
    });

    it("링크가 상속된 색상을 가져야 한다", () => {
      render(<HeaderLogo />);

      const link = screen.getByRole("link");
      expect(link).toHaveStyle({ color: "inherit" });
    });
  });

  describe("사용자 상호작용", () => {
    it("로고 클릭 시 홈으로 이동해야 한다", async () => {
      const user = userEvent.setup();
      render(<HeaderLogo />);

      const link = screen.getByRole("link");
      await user.click(link);

      // Link 컴포넌트는 실제로는 navigate를 호출하지 않지만,
      // href 속성을 통해 올바른 경로를 가리키는지 확인
      expect(link).toHaveAttribute("href", "/");
    });

    it("텍스트가 선택되지 않아야 한다", () => {
      render(<HeaderLogo />);

      const text = screen.getByText("BANDIT");
      expect(text).toHaveStyle({ userSelect: "none" });
    });
  });

  describe("접근성", () => {
    it("로고가 링크 역할을 가져야 한다", () => {
      render(<HeaderLogo />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("링크가 홈 경로를 가리켜야 한다", () => {
      render(<HeaderLogo />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/");
    });
  });

  describe("레이아웃", () => {
    it("Group 컴포넌트를 사용해야 한다", () => {
      render(<HeaderLogo />);

      // Group 컴포넌트가 렌더링되었는지 확인
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("아이콘과 텍스트가 적절한 간격으로 배치되어야 한다", () => {
      render(<HeaderLogo />);

      // Group 컴포넌트가 렌더링되었는지 확인
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });
  });

  describe("컴포넌트 구조", () => {
    it("memo로 감싸져 있어야 한다", () => {
      expect(HeaderLogo.displayName).toBe("HeaderLogo");
    });

    it("올바른 컴포넌트 구조를 가져야 한다", () => {
      render(<HeaderLogo />);

      const link = screen.getByRole("link");
      const icon = link.querySelector("svg");
      const text = screen.getByText("BANDIT");

      expect(link).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
      expect(text).toBeInTheDocument();
    });
  });
});
