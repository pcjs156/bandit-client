import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render } from "@src/test/helpers/testUtils";
import RegisterPage from "../RegisterPage";
import { useRegisterSubmit } from "@src/hooks/useRegisterSubmit";

// Mock useRegisterSubmit hook
vi.mock("@src/hooks/useRegisterSubmit");
const mockUseRegisterSubmit = vi.mocked(useRegisterSubmit);

// Mock useRegisterForm hook
vi.mock("@src/hooks/useRegisterForm", () => ({
  useRegisterForm: () => ({
    values: { userId: "", password: "", nickname: "" },
    errors: {},
    setFieldValue: vi.fn(),
    setValues: vi.fn(),
    validate: vi.fn(),
    validateField: vi.fn(),
    onSubmit: vi.fn(
      (
        handler: (values: {
          userId: string;
          password: string;
          nickname: string;
        }) => void,
      ) =>
        (e: React.FormEvent) => {
          e.preventDefault();
          handler({ userId: "", password: "", nickname: "" });
        },
    ),
    getInputProps: () => ({
      value: "",
      onChange: vi.fn(),
      error: undefined,
      disabled: false,
    }),
  }),
}));

const renderRegisterPage = () => {
  return render(<RegisterPage />);
};

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRegisterSubmit.mockReturnValue({
      handleSubmit: vi.fn(),
      isSubmitDisabled: vi.fn(() => false),
      isFormDisabled: false,
      isLoading: false,
      error: null,
      status: "idle",
    });
  });

  describe("렌더링", () => {
    it("회원가입 페이지가 올바르게 렌더링되어야 한다", () => {
      renderRegisterPage();

      // AppLogo가 표시되어야 함
      expect(
        screen.getByRole("heading", { name: "BANDIT" }),
      ).toBeInTheDocument();

      // 페이지 제목이 표시되어야 함
      expect(
        screen.getByRole("heading", { name: "회원가입" }),
      ).toBeInTheDocument();

      // 폼 필드들이 표시되어야 함
      expect(screen.getByLabelText("아이디")).toBeInTheDocument();
      expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
      expect(screen.getByLabelText("닉네임")).toBeInTheDocument();

      // 제출 버튼이 표시되어야 함
      expect(
        screen.getByRole("button", { name: "회원가입" }),
      ).toBeInTheDocument();

      // 푸터 링크가 표시되어야 함
      expect(screen.getByText("이미 계정이 있으신가요?")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "로그인" })).toBeInTheDocument();
    });

    it("AppLogo가 올바르게 렌더링되어야 한다", () => {
      renderRegisterPage();

      // BANDIT 제목이 표시되어야 함
      expect(
        screen.getByRole("heading", { name: "BANDIT" }),
      ).toBeInTheDocument();

      // 음악 아이콘이 표시되어야 함
      const musicIcon =
        document.querySelector('svg[data-icon="music"]') ||
        document.querySelector(".tabler-icon-music");
      expect(musicIcon).toBeInTheDocument();
    });

    it("폼 필드들이 올바른 placeholder를 가져야 한다", () => {
      renderRegisterPage();

      expect(
        screen.getByPlaceholderText("영문, 숫자 4-20자"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("영문, 숫자 포함 8자 이상"),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("2-20자")).toBeInTheDocument();
    });

    it("폼 필드들이 올바른 접근성 속성을 가져야 한다", () => {
      renderRegisterPage();

      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");
      const nicknameInput = screen.getByLabelText("닉네임");
      const submitButton = screen.getByRole("button", { name: "회원가입" });

      // 실제 렌더링된 input 요소의 속성 확인
      expect(userIdInput).toHaveAttribute("id");
      expect(passwordInput).toHaveAttribute("id");
      expect(nicknameInput).toHaveAttribute("id");
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });

  describe("폼 동작", () => {
    it("폼 제출 시 handleSubmit이 호출되어야 한다", async () => {
      const user = userEvent.setup();
      const mockHandleSubmit = vi.fn();

      mockUseRegisterSubmit.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitDisabled: vi.fn(() => false),
        isFormDisabled: false,
        isLoading: false,
        error: null,
        status: "idle",
      });

      renderRegisterPage();

      const submitButton = screen.getByRole("button", { name: "회원가입" });
      await user.click(submitButton);

      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  describe("로딩 상태", () => {
    it("로딩 중일 때 폼 필드들이 비활성화되어야 한다", () => {
      mockUseRegisterSubmit.mockReturnValue({
        handleSubmit: vi.fn(),
        isSubmitDisabled: vi.fn(() => false),
        isFormDisabled: true,
        isLoading: true,
        error: null,
        status: "loading",
      });

      renderRegisterPage();

      const userIdInput = screen.getByLabelText("아이디");
      const passwordInput = screen.getByLabelText("비밀번호");
      const nicknameInput = screen.getByLabelText("닉네임");
      const submitButton = screen.getByRole("button", { name: "회원가입" });

      expect(userIdInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(nicknameInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe("에러 처리", () => {
    it("에러가 있을 때 에러 메시지가 표시되어야 한다", () => {
      const errorMessage = "회원가입에 실패했습니다";

      mockUseRegisterSubmit.mockReturnValue({
        handleSubmit: vi.fn(),
        isSubmitDisabled: vi.fn(() => false),
        isFormDisabled: false,
        isLoading: false,
        error: errorMessage,
        status: "unauthenticated",
      });

      renderRegisterPage();

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("에러가 없을 때 에러 메시지가 표시되지 않아야 한다", () => {
      mockUseRegisterSubmit.mockReturnValue({
        handleSubmit: vi.fn(),
        isSubmitDisabled: vi.fn(() => false),
        isFormDisabled: false,
        isLoading: false,
        error: null,
        status: "idle",
      });

      renderRegisterPage();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("폼 필드들이 적절한 라벨을 가져야 한다", () => {
      renderRegisterPage();

      expect(screen.getByLabelText("아이디")).toBeInTheDocument();
      expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
      expect(screen.getByLabelText("닉네임")).toBeInTheDocument();
    });

    it("제출 버튼이 적절한 텍스트를 가져야 한다", () => {
      renderRegisterPage();

      const submitButton = screen.getByRole("button", { name: "회원가입" });
      expect(submitButton).toHaveTextContent("회원가입");
    });
  });

  describe("네비게이션", () => {
    it("로그인 링크가 올바른 경로로 연결되어야 한다", () => {
      renderRegisterPage();

      const loginLink = screen.getByRole("link", { name: "로그인" });
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("로그인 링크가 접근 가능해야 한다", () => {
      renderRegisterPage();

      const loginLink = screen.getByRole("link", { name: "로그인" });
      expect(loginLink).toBeInTheDocument();
    });
  });

  describe("레이아웃", () => {
    it("컨테이너가 올바른 크기를 가져야 한다", () => {
      renderRegisterPage();

      const container = document.querySelector('[data-size="xs"]');
      expect(container).toBeInTheDocument();
    });

    it("Paper 컴포넌트가 올바른 스타일을 가져야 한다", () => {
      renderRegisterPage();

      // 실제 렌더링된 Paper 컴포넌트의 스타일 확인
      const paper = document.querySelector(".mantine-Paper-root");
      expect(paper).toBeInTheDocument();
      expect(paper).toHaveAttribute("style");
    });
  });
});
