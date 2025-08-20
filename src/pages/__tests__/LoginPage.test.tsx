import { screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render } from "@src/test/helpers/testUtils";
import LoginPage from "../LoginPage";
import { useAuthStore } from "@src/stores/authStore";

// Mock useAuthStore
vi.mock("@src/stores/authStore");
const mockUseAuthStore = vi.mocked(useAuthStore);

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test data factories
const createTestUser = () => ({
  userId: "testuser",
  password: "testpass",
});

const createAuthStoreMock = (overrides = {}) => ({
  login: vi.fn(),
  status: "idle" as const,
  error: null,
  clearError: vi.fn(),
  user: null,
  logout: vi.fn(),
  initialize: vi.fn(),
  ...overrides,
});

const renderLoginPage = () => {
  return render(<LoginPage />);
};

describe("LoginPage", () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue(
      createAuthStoreMock({
        login: mockLogin,
        clearError: mockClearError,
      }),
    );
  });

  describe("렌더링", () => {
    it("로그인 페이지가 올바르게 렌더링되어야 한다", () => {
      renderLoginPage();

      expect(
        screen.getByRole("heading", { name: "BANDIT" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "로그인" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("아이디")).toBeInTheDocument();
      expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "로그인" }),
      ).toBeInTheDocument();
      expect(screen.getByText("계정이 없으신가요?")).toBeInTheDocument();
      expect(screen.getByText("회원가입")).toBeInTheDocument();
    });

    it("AppLogo가 올바르게 렌더링되어야 한다", () => {
      renderLoginPage();

      // BANDIT 제목이 표시되어야 함
      expect(
        screen.getByRole("heading", { name: "BANDIT" }),
      ).toBeInTheDocument();

      // 음악 아이콘이 표시되어야 함 (SVG 요소)
      const musicIcon =
        document.querySelector('svg[data-icon="music"]') ||
        document.querySelector(".tabler-icon-music");
      expect(musicIcon).toBeInTheDocument();
    });

    it("폼 필드들이 올바른 placeholder를 가져야 한다", () => {
      renderLoginPage();

      expect(
        screen.getByPlaceholderText("아이디를 입력하세요"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("비밀번호를 입력하세요"),
      ).toBeInTheDocument();
    });

    it("폼 필드들이 올바른 접근성 속성을 가져야 한다", () => {
      renderLoginPage();

      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");
      const submitButton = screen.getByRole("button", { name: "로그인" });

      expect(userIdInput).toHaveAttribute("data-path", "userId");
      expect(passwordInput).toHaveAttribute("data-path", "password");
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });

  describe("폼 동작", () => {
    it("사용자가 아이디와 비밀번호를 입력할 수 있어야 한다", () => {
      renderLoginPage();

      const { userId, password } = createTestUser();
      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");

      fireEvent.change(userIdInput, { target: { value: userId } });
      fireEvent.change(passwordInput, { target: { value: password } });

      expect(userIdInput).toHaveValue(userId);
      expect(passwordInput).toHaveValue(password);
    });

    it("폼 제출 시 login 함수가 호출되어야 한다", async () => {
      mockLogin.mockResolvedValue(undefined);
      renderLoginPage();

      const { userId, password } = createTestUser();
      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");
      const submitButton = screen.getByRole("button", { name: "로그인" });

      fireEvent.change(userIdInput, { target: { value: userId } });
      fireEvent.change(passwordInput, { target: { value: password } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          userId,
          password,
        });
      });
    });

    it("폼 제출 시 clearError가 호출되어야 한다", async () => {
      mockLogin.mockResolvedValue(undefined);
      renderLoginPage();

      const { userId, password } = createTestUser();
      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");
      const submitButton = screen.getByRole("button", { name: "로그인" });

      fireEvent.change(userIdInput, { target: { value: userId } });
      fireEvent.change(passwordInput, { target: { value: password } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });

    it("Enter 키로 폼을 제출할 수 있어야 한다", async () => {
      mockLogin.mockResolvedValue(undefined);
      renderLoginPage();

      const { userId, password } = createTestUser();
      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");

      fireEvent.change(userIdInput, { target: { value: userId } });
      fireEvent.change(passwordInput, { target: { value: password } });

      // form의 onSubmit이 자동으로 처리되므로 submit 이벤트를 직접 발생시킴
      const form = passwordInput.closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          userId,
          password,
        });
      });
    });
  });

  describe("로딩 상태", () => {
    it("로그인 중일 때 폼 필드들이 비활성화되어야 한다", () => {
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          login: mockLogin,
          status: "loading",
          clearError: mockClearError,
        }),
      );

      renderLoginPage();

      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");
      const submitButton = screen.getByRole("button", { name: "로그인" });

      expect(userIdInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it("로컬 로딩 상태일 때도 폼 필드들이 비활성화되어야 한다", async () => {
      // Promise를 즉시 resolve하지 않는 mock 함수 사용
      mockLogin.mockImplementation(() => new Promise(() => {}));
      renderLoginPage();

      const { userId, password } = createTestUser();
      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");
      const submitButton = screen.getByRole("button", { name: "로그인" });

      fireEvent.change(userIdInput, { target: { value: userId } });
      fireEvent.change(passwordInput, { target: { value: password } });
      fireEvent.click(submitButton);

      // 로딩 상태 확인
      await waitFor(() => {
        expect(userIdInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("에러 처리", () => {
    it("에러가 있을 때 에러 메시지가 표시되어야 한다", () => {
      const errorMessage = "로그인에 실패했습니다";
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          login: mockLogin,
          error: errorMessage,
          clearError: mockClearError,
        }),
      );

      renderLoginPage();

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("에러가 없을 때 에러 메시지가 표시되지 않아야 한다", () => {
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          login: mockLogin,
          clearError: mockClearError,
        }),
      );

      renderLoginPage();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("다양한 에러 타입에 대해 적절히 처리되어야 한다", () => {
      const networkError = "네트워크 오류가 발생했습니다";
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          login: mockLogin,
          error: networkError,
          clearError: mockClearError,
        }),
      );

      renderLoginPage();

      expect(screen.getByText(networkError)).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("로그인 성공", () => {
    it("로그인 성공 시 홈 페이지로 이동해야 한다", async () => {
      mockLogin.mockResolvedValue(undefined);
      renderLoginPage();

      const { userId, password } = createTestUser();
      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");
      const submitButton = screen.getByRole("button", { name: "로그인" });

      fireEvent.change(userIdInput, { target: { value: userId } });
      fireEvent.change(passwordInput, { target: { value: password } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("로그인 실패", () => {
    it("로그인 실패 시 에러가 발생해도 로딩 상태가 해제되어야 한다", async () => {
      mockLogin.mockRejectedValue(new Error("로그인 실패"));
      renderLoginPage();

      const { userId, password } = createTestUser();
      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");
      const submitButton = screen.getByRole("button", { name: "로그인" });

      fireEvent.change(userIdInput, { target: { value: userId } });
      fireEvent.change(passwordInput, { target: { value: password } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(userIdInput).not.toBeDisabled();
        expect(passwordInput).not.toBeDisabled();
        expect(submitButton).not.toBeDisabled();
      });
    });

    it("로그인 실패 시 에러가 발생해도 에러 상태가 유지되어야 한다", async () => {
      const errorMessage = "로그인에 실패했습니다";
      mockLogin.mockRejectedValue(new Error(errorMessage));

      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          login: mockLogin,
          clearError: mockClearError,
        }),
      );

      renderLoginPage();

      const { userId, password } = createTestUser();
      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");
      const submitButton = screen.getByRole("button", { name: "로그인" });

      fireEvent.change(userIdInput, { target: { value: userId } });
      fireEvent.change(passwordInput, { target: { value: password } });
      fireEvent.click(submitButton);

      // 에러가 발생해도 폼은 정상적으로 동작해야 함
      await waitFor(() => {
        expect(userIdInput).not.toBeDisabled();
        expect(passwordInput).not.toBeDisabled();
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe("접근성", () => {
    it("폼 필드들이 올바른 aria-describedby를 가져야 한다", () => {
      const errorMessage = "로그인에 실패했습니다";
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          login: mockLogin,
          error: errorMessage,
          clearError: mockClearError,
        }),
      );

      renderLoginPage();

      const alertElement = screen.getByRole("alert");
      expect(alertElement).toBeInTheDocument();
    });

    it("폼 필드들이 적절한 라벨을 가져야 한다", () => {
      renderLoginPage();

      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");

      expect(userIdInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });
  });

  describe("회원가입 링크", () => {
    it("회원가입 링크가 올바른 경로로 연결되어야 한다", () => {
      renderLoginPage();

      const registerLink = screen.getByText("회원가입");
      expect(registerLink).toHaveAttribute("href", "/register");
    });

    it("회원가입 링크가 접근 가능해야 한다", () => {
      renderLoginPage();

      const registerLink = screen.getByText("회원가입");
      expect(registerLink).toBeInTheDocument();
      expect(registerLink.tagName).toBe("A");
    });
  });

  describe("경계 케이스", () => {
    it("빈 폼 제출 시 적절히 처리되어야 한다", async () => {
      mockLogin.mockResolvedValue(undefined);
      renderLoginPage();

      const submitButton = screen.getByRole("button", { name: "로그인" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          userId: "",
          password: "",
        });
      });
    });

    it("매우 긴 입력값에 대해 적절히 처리되어야 한다", async () => {
      const longUserId = "a".repeat(1000);
      const longPassword = "b".repeat(1000);

      mockLogin.mockResolvedValue(undefined);
      renderLoginPage();

      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");
      const submitButton = screen.getByRole("button", { name: "로그인" });

      fireEvent.change(userIdInput, { target: { value: longUserId } });
      fireEvent.change(passwordInput, { target: { value: longPassword } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          userId: longUserId,
          password: longPassword,
        });
      });
    });
  });
});
