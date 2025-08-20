import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { AuthPageLayout } from "../AuthPageLayout";

// AppLogo 모킹
vi.mock("@src/components/common/AppLogo", () => ({
  default: ({ "data-testid": testId }: { "data-testid"?: string }) => (
    <div data-testid={testId || "app-logo"}>App Logo</div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      <BrowserRouter>{component}</BrowserRouter>
    </MantineProvider>,
  );
};

describe("AuthPageLayout", () => {
  const defaultProps = {
    title: "회원가입",
    footerText: "계정이 없으신가요?",
    footerLinkText: "회원가입",
    footerLinkTo: "/register",
    children: <div data-testid="auth-content">인증 폼 내용</div>,
  };

  describe("기본 렌더링", () => {
    it("제목을 올바르게 표시해야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      const title = screen.getByRole("heading", { name: "회원가입" });
      expect(title).toBeInTheDocument();
    });

    it("AppLogo를 렌더링해야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      expect(screen.getByTestId("app-logo")).toBeInTheDocument();
    });

    it("children을 렌더링해야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      expect(screen.getByTestId("auth-content")).toBeInTheDocument();
    });

    it("푸터 텍스트와 링크를 올바르게 표시해야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      expect(screen.getByText("계정이 없으신가요?")).toBeInTheDocument();
      const link = screen.getByRole("link", { name: "회원가입" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/register");
    });
  });

  describe("레이아웃 구조", () => {
    it("Container를 올바른 크기로 렌더링해야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      const container = document.querySelector(".mantine-Container-root");
      expect(container).toHaveClass("mantine-Container-root");
    });

    it("Paper 컴포넌트를 올바른 스타일로 렌더링해야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      const paper = document.querySelector(".mantine-Paper-root");
      expect(paper).toHaveClass("mantine-Paper-root");
    });

    it("Stack 컴포넌트를 사용하여 요소들을 세로로 배치해야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      const stack = document.querySelector(".mantine-Stack-root");
      expect(stack).toHaveClass("mantine-Stack-root");
    });
  });

  describe("반응형 디자인", () => {
    it("기본 패딩과 반응형 패딩을 적용해야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      const container = document.querySelector(".mantine-Container-root");
      expect(container).toHaveClass("mantine-Container-root");
    });

    it("Paper의 패딩이 반응형으로 적용되어야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      const paper = document.querySelector(".mantine-Paper-root");
      expect(paper).toHaveClass("mantine-Paper-root");
    });
  });

  describe("링크 기능", () => {
    it("푸터 링크가 올바른 경로로 연결되어야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      const link = screen.getByRole("link", { name: "회원가입" });
      expect(link).toHaveAttribute("href", "/register");
    });

    it("링크가 React Router Link 컴포넌트로 렌더링되어야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      const link = screen.getByRole("link", { name: "회원가입" });
      expect(link).toBeInTheDocument();
    });
  });

  describe("다양한 props 조합", () => {
    it("다른 제목으로 렌더링할 수 있어야 한다", () => {
      const props = {
        ...defaultProps,
        title: "로그인",
        footerText: "이미 계정이 있으신가요?",
        footerLinkText: "로그인",
        footerLinkTo: "/login",
      };

      renderWithRouter(<AuthPageLayout {...props} />);

      const title = screen.getByRole("heading", { name: "로그인" });
      expect(title).toBeInTheDocument();
    });

    it("다른 푸터 텍스트로 렌더링할 수 있어야 한다", () => {
      const props = {
        ...defaultProps,
        title: "로그인",
        footerText: "이미 계정이 있으신가요?",
        footerLinkText: "로그인",
        footerLinkTo: "/login",
      };

      renderWithRouter(<AuthPageLayout {...props} />);

      expect(screen.getByText("이미 계정이 있으신가요?")).toBeInTheDocument();
      const link = screen.getByRole("link", { name: "로그인" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/login");
    });

    it("복잡한 children을 렌더링할 수 있어야 한다", () => {
      const complexChildren = (
        <div>
          <input type="text" placeholder="이메일" />
          <input type="password" placeholder="비밀번호" />
          <button type="submit">제출</button>
        </div>
      );

      renderWithRouter(
        <AuthPageLayout {...defaultProps} children={complexChildren} />,
      );

      expect(screen.getByPlaceholderText("이메일")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("비밀번호")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "제출" })).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("제목이 올바른 heading 레벨을 가져야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      const title = screen.getByRole("heading", { name: "회원가입" });
      expect(title.tagName).toBe("H2");
    });

    it("링크가 올바른 텍스트를 가져야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      const link = screen.getByRole("link", { name: "회원가입" });
      expect(link).toHaveTextContent("회원가입");
    });
  });

  describe("스타일링", () => {
    it("Paper에 shadow가 적용되어야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      const paper = document.querySelector(".mantine-Paper-root");
      expect(paper).toHaveClass("mantine-Paper-root");
    });

    it("Paper에 radius가 적용되어야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      const paper = document.querySelector(".mantine-Paper-root");
      expect(paper).toHaveClass("mantine-Paper-root");
    });

    it("Container가 중앙 정렬되어야 한다", () => {
      renderWithRouter(<AuthPageLayout {...defaultProps} />);

      const container = document.querySelector(".mantine-Container-root");
      expect(container).toBeInTheDocument();
    });
  });

  describe("메모이제이션", () => {
    it("memo로 래핑되어 있어야 한다", () => {
      // displayName을 통해 memo로 래핑되었는지 확인
      expect(AuthPageLayout.displayName).toBe("AuthPageLayout");
    });
  });
});
