import { screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { render } from "@src/test/helpers/testUtils";
import RegisterPage from "../RegisterPage";

// Mock AuthPageLayout component
vi.mock("@src/components/auth/AuthPageLayout", () => ({
  AuthPageLayout: ({
    children,
    title,
    footerText,
    footerLinkText,
    footerLinkTo,
  }: any) => (
    <div data-testid="auth-page-layout">
      <div data-testid="auth-title">{title}</div>
      <div data-testid="auth-footer-text">{footerText}</div>
      <div data-testid="auth-footer-link-text">{footerLinkText}</div>
      <div data-testid="auth-footer-link-to">{footerLinkTo}</div>
      <div data-testid="auth-content">{children}</div>
    </div>
  ),
}));

// Mock RegisterForm component
vi.mock("@src/components/auth/RegisterForm", () => ({
  RegisterForm: () => <div data-testid="register-form">RegisterForm</div>,
}));

const renderRegisterPage = () => {
  return render(<RegisterPage />);
};

describe("RegisterPage", () => {
  describe("렌더링", () => {
    it("회원가입 페이지가 올바르게 렌더링되어야 한다", () => {
      renderRegisterPage();

      expect(screen.getByTestId("auth-page-layout")).toBeInTheDocument();
      expect(screen.getByTestId("register-form")).toBeInTheDocument();
    });

    it("AuthPageLayout에 올바른 props가 전달되어야 한다", () => {
      renderRegisterPage();

      expect(screen.getByTestId("auth-title")).toHaveTextContent("회원가입");
      expect(screen.getByTestId("auth-footer-text")).toHaveTextContent(
        "이미 계정이 있으신가요?"
      );
      expect(screen.getByTestId("auth-footer-link-text")).toHaveTextContent(
        "로그인"
      );
      expect(screen.getByTestId("auth-footer-link-to")).toHaveTextContent(
        "/login"
      );
    });

    it("RegisterForm 컴포넌트가 렌더링되어야 한다", () => {
      renderRegisterPage();

      expect(screen.getByTestId("register-form")).toBeInTheDocument();
    });
  });

  describe("구조", () => {
    it("AuthPageLayout이 RegisterForm을 감싸고 있어야 한다", () => {
      renderRegisterPage();

      const authLayout = screen.getByTestId("auth-page-layout");
      const registerForm = screen.getByTestId("register-form");

      expect(authLayout).toContainElement(registerForm);
    });
  });
});
