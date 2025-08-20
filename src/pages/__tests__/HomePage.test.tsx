import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render } from "@src/test/helpers/testUtils";
import HomePage from "../HomePage";
import { useAuthStore } from "@src/stores/authStore";

// Mock useAuthStore
vi.mock("@src/stores/authStore");
const mockUseAuthStore = vi.mocked(useAuthStore);

// Mock useNavigate for Link components
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
  nickname: "테스트유저",
});

const createAuthStoreMock = (overrides = {}) => ({
  user: null,
  status: "idle" as const,
  ...overrides,
});

const renderHomePage = () => {
  return render(<HomePage />);
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("비인증 사용자 렌더링", () => {
    beforeEach(() => {
      mockUseAuthStore.mockReturnValue(createAuthStoreMock());
    });

    it("비인증 사용자에게는 로그인/회원가입 링크가 표시되어야 한다", () => {
      renderHomePage();

      expect(
        screen.getByRole("heading", { name: "Bandit" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "회원가입" })
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "로그인" })).toBeInTheDocument();
    });

    it("Bandit 제목이 올바르게 렌더링되어야 한다", () => {
      renderHomePage();

      // Bandit 제목이 표시되어야 함
      expect(
        screen.getByRole("heading", { name: "Bandit" })
      ).toBeInTheDocument();

      // 제목이 H1 태그여야 함
      const title = screen.getByRole("heading", { name: "Bandit" });
      expect(title.tagName).toBe("H1");
    });

    it("비인증 사용자에게는 작은 컨테이너가 사용되어야 한다", () => {
      renderHomePage();

      const container = document.querySelector('[data-size="sm"]');
      expect(container).toBeInTheDocument();
    });

    it("Bandit 제목이 올바른 스타일로 표시되어야 한다", () => {
      renderHomePage();

      const title = screen.getByRole("heading", { name: "Bandit" });
      expect(title.tagName).toBe("H1");
      expect(title).toHaveAttribute("data-order", "1");
    });

    it("버튼들이 올바른 스타일과 링크를 가져야 한다", () => {
      renderHomePage();

      const registerButton = screen.getByRole("link", { name: "회원가입" });
      const loginButton = screen.getByRole("link", { name: "로그인" });

      expect(registerButton).toHaveAttribute("href", "/register");
      expect(loginButton).toHaveAttribute("href", "/login");
      expect(registerButton).toHaveAttribute("data-size", "lg");
      expect(loginButton).toHaveAttribute("data-variant", "outline");
    });
  });

  describe("인증된 사용자 렌더링", () => {
    const testUser = createTestUser();

    beforeEach(() => {
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          user: testUser,
          status: "authenticated",
        })
      );
    });

    it("인증된 사용자에게는 환영 메시지가 표시되어야 한다", () => {
      renderHomePage();

      expect(
        screen.getByRole("heading", {
          name: `환영합니다, ${testUser.nickname}님!`,
        })
      ).toBeInTheDocument();
    });

    it("인증된 사용자에게는 밴드 관련 버튼들이 표시되어야 한다", () => {
      renderHomePage();

      expect(
        screen.getByRole("button", { name: "밴드 만들기" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "밴드 찾기" })
      ).toBeInTheDocument();
    });

    it("밴드 버튼들이 올바른 스타일을 가져야 한다", () => {
      renderHomePage();

      const createButton = screen.getByRole("button", { name: "밴드 만들기" });
      const findButton = screen.getByRole("button", { name: "밴드 찾기" });

      expect(createButton).toHaveAttribute("data-size", "lg");
      expect(findButton).toHaveAttribute("data-size", "lg");
      expect(findButton).toHaveAttribute("data-variant", "outline");
    });

    it("인증된 사용자에게는 빠른 시작 카드가 표시되어야 한다", () => {
      renderHomePage();

      expect(
        screen.getByRole("heading", { name: "빠른 시작" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("• 새로운 밴드를 만들어 멤버를 모집하세요")
      ).toBeInTheDocument();
      expect(
        screen.getByText("• 기존 밴드에 가입 요청을 보내세요")
      ).toBeInTheDocument();
      expect(
        screen.getByText("• 설정에서 프로필을 꾸며보세요")
      ).toBeInTheDocument();
    });

    it("빠른 시작 카드가 올바른 스타일을 가져야 한다", () => {
      renderHomePage();

      const card = screen
        .getByRole("heading", { name: "빠른 시작" })
        .closest(".mantine-Card-root");
      expect(card).toBeInTheDocument();
    });

    it("인증된 사용자에게는 중간 크기 컨테이너가 사용되어야 한다", () => {
      renderHomePage();

      const container = document.querySelector('[data-size="md"]');
      expect(container).toBeInTheDocument();
    });

    it("사용자 닉네임이 올바르게 표시되어야 한다", () => {
      renderHomePage();

      const title = screen.getByRole("heading", {
        name: `환영합니다, ${testUser.nickname}님!`,
      });
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute("data-order", "1");
    });

    it("부제목이 올바르게 표시되어야 한다", () => {
      renderHomePage();

      expect(screen.getByText("밴드 활동을 시작해보세요")).toBeInTheDocument();
    });
  });

  describe("인증 상태별 조건부 렌더링", () => {
    it("status가 'loading'일 때는 비인증 상태로 렌더링되어야 한다", () => {
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          status: "loading",
        })
      );

      renderHomePage();

      expect(
        screen.getByRole("heading", { name: "Bandit" })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /환영합니다/ })
      ).not.toBeInTheDocument();
    });

    it("status가 'authenticated'이지만 user가 null일 때는 비인증 상태로 렌더링되어야 한다", () => {
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          status: "authenticated",
          user: null,
        })
      );

      renderHomePage();

      expect(
        screen.getByRole("heading", { name: "Bandit" })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /환영합니다/ })
      ).not.toBeInTheDocument();
    });

    it("status가 'unauthenticated'일 때는 비인증 상태로 렌더링되어야 한다", () => {
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          status: "unauthenticated",
        })
      );

      renderHomePage();

      expect(
        screen.getByRole("heading", { name: "Bandit" })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /환영합니다/ })
      ).not.toBeInTheDocument();
    });
  });

  describe("사용자 상호작용", () => {
    it("밴드 만들기 버튼이 클릭 가능해야 한다", async () => {
      const user = userEvent.setup();
      const testUser = createTestUser();
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          user: testUser,
          status: "authenticated",
        })
      );

      renderHomePage();

      const bandCreateButton = screen.getByRole("button", {
        name: "밴드 만들기",
      });
      expect(bandCreateButton).toBeEnabled();

      await user.click(bandCreateButton);
      // 버튼 클릭 시 에러가 발생하지 않아야 함
    });

    it("밴드 찾기 버튼이 클릭 가능해야 한다", async () => {
      const user = userEvent.setup();
      const testUser = createTestUser();
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          user: testUser,
          status: "authenticated",
        })
      );

      renderHomePage();

      const bandFindButton = screen.getByRole("button", { name: "밴드 찾기" });
      expect(bandFindButton).toBeEnabled();

      await user.click(bandFindButton);
      // 버튼 클릭 시 에러가 발생하지 않아야 함
    });

    it("회원가입 링크가 클릭 가능해야 한다", async () => {
      const user = userEvent.setup();
      mockUseAuthStore.mockReturnValue(createAuthStoreMock());

      renderHomePage();

      const registerLink = screen.getByRole("link", { name: "회원가입" });
      expect(registerLink).toBeInTheDocument();

      await user.click(registerLink);
      // 링크 클릭 시 에러가 발생하지 않아야 함
    });

    it("로그인 링크가 클릭 가능해야 한다", async () => {
      const user = userEvent.setup();
      mockUseAuthStore.mockReturnValue(createAuthStoreMock());

      renderHomePage();

      const loginLink = screen.getByRole("link", { name: "로그인" });
      expect(loginLink).toBeInTheDocument();

      await user.click(loginLink);
      // 링크 클릭 시 에러가 발생하지 않아야 함
    });
  });

  describe("레이아웃 및 스타일링", () => {
    it("비인증 사용자 페이지가 올바른 컨테이너 크기를 가져야 한다", () => {
      mockUseAuthStore.mockReturnValue(createAuthStoreMock());
      renderHomePage();

      const container = document.querySelector('[data-size="sm"]');
      expect(container).toBeInTheDocument();
    });

    it("인증된 사용자 페이지가 올바른 컨테이너 크기를 가져야 한다", () => {
      const testUser = createTestUser();
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          user: testUser,
          status: "authenticated",
        })
      );

      renderHomePage();

      const container = document.querySelector('[data-size="md"]');
      expect(container).toBeInTheDocument();
    });

    it("제목들이 올바른 heading 레벨을 가져야 한다", () => {
      mockUseAuthStore.mockReturnValue(createAuthStoreMock());
      renderHomePage();

      const title = screen.getByRole("heading", { name: "Bandit" });
      expect(title).toHaveAttribute("data-order", "1");
    });
  });

  describe("접근성", () => {
    it("비인증 사용자 페이지의 제목이 올바른 heading 레벨을 가져야 한다", () => {
      mockUseAuthStore.mockReturnValue(createAuthStoreMock());
      renderHomePage();

      const title = screen.getByRole("heading", { name: "Bandit" });
      expect(title).toHaveAttribute("data-order", "1");
    });

    it("인증된 사용자 페이지의 제목이 올바른 heading 레벨을 가져야 한다", () => {
      const testUser = createTestUser();
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          user: testUser,
          status: "authenticated",
        })
      );

      renderHomePage();

      const title = screen.getByRole("heading", {
        name: `환영합니다, ${testUser.nickname}님!`,
      });
      expect(title).toHaveAttribute("data-order", "1");
    });

    it("빠른 시작 카드의 제목이 올바른 heading 레벨을 가져야 한다", () => {
      const testUser = createTestUser();
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          user: testUser,
          status: "authenticated",
        })
      );

      renderHomePage();

      const cardTitle = screen.getByRole("heading", { name: "빠른 시작" });
      expect(cardTitle).toHaveAttribute("data-order", "3");
    });

    it("모든 링크가 올바른 href를 가져야 한다", () => {
      mockUseAuthStore.mockReturnValue(createAuthStoreMock());
      renderHomePage();

      const registerLink = screen.getByRole("link", { name: "회원가입" });
      const loginLink = screen.getByRole("link", { name: "로그인" });

      expect(registerLink).toHaveAttribute("href", "/register");
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  describe("에러 상태 처리", () => {
    it("status가 'error'일 때는 비인증 상태로 렌더링되어야 한다", () => {
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          status: "error",
        })
      );

      renderHomePage();

      expect(
        screen.getByRole("heading", { name: "Bandit" })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /환영합니다/ })
      ).not.toBeInTheDocument();
    });
  });
});
