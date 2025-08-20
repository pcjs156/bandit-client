import { screen, fireEvent } from "@testing-library/react";
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

      expect(screen.getByRole("heading", { name: "Bandit" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "회원가입" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "로그인" })).toBeInTheDocument();
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
        screen.getByRole("heading", { name: `환영합니다, ${testUser.nickname}님!` })
      ).toBeInTheDocument();
    });

    it("인증된 사용자에게는 밴드 관련 버튼들이 표시되어야 한다", () => {
      renderHomePage();

      expect(screen.getByRole("button", { name: "밴드 만들기" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "밴드 찾기" })).toBeInTheDocument();
    });

    it("인증된 사용자에게는 빠른 시작 카드가 표시되어야 한다", () => {
      renderHomePage();

      expect(screen.getByRole("heading", { name: "빠른 시작" })).toBeInTheDocument();
      expect(screen.getByText("• 새로운 밴드를 만들어 멤버를 모집하세요")).toBeInTheDocument();
      expect(screen.getByText("• 기존 밴드에 가입 요청을 보내세요")).toBeInTheDocument();
      expect(screen.getByText("• 설정에서 프로필을 꾸며보세요")).toBeInTheDocument();
    });

    it("인증된 사용자에게는 중간 크기 컨테이너가 사용되어야 한다", () => {
      renderHomePage();

      const container = document.querySelector('[data-size="md"]');
      expect(container).toBeInTheDocument();
    });

    it("사용자 닉네임이 올바르게 표시되어야 한다", () => {
      renderHomePage();

      // 텍스트가 여러 요소로 나뉘어져 있으므로 전체 제목을 확인
      const title = screen.getByRole("heading", { name: `환영합니다, ${testUser.nickname}님!` });
      expect(title).toBeInTheDocument();
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

      expect(screen.getByRole("heading", { name: "Bandit" })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: /환영합니다/ })).not.toBeInTheDocument();
    });

    it("status가 'authenticated'이지만 user가 null일 때는 비인증 상태로 렌더링되어야 한다", () => {
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          status: "authenticated",
          user: null,
        })
      );

      renderHomePage();

      expect(screen.getByRole("heading", { name: "Bandit" })).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: /환영합니다/ })).not.toBeInTheDocument();
    });
  });

  describe("버튼 동작", () => {
    it("밴드 만들기 버튼이 클릭 가능해야 한다", () => {
      const testUser = createTestUser();
      mockUseAuthStore.mockReturnValue(
        createAuthStoreMock({
          user: testUser,
          status: "authenticated",
        })
      );

      renderHomePage();

      const bandCreateButton = screen.getByRole("button", { name: "밴드 만들기" });
      expect(bandCreateButton).toBeEnabled();
      
      fireEvent.click(bandCreateButton);
      // 버튼 클릭 시 에러가 발생하지 않아야 함
    });

    it("밴드 찾기 버튼이 클릭 가능해야 한다", () => {
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
      
      fireEvent.click(bandFindButton);
      // 버튼 클릭 시 에러가 발생하지 않아야 함
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

      const title = screen.getByRole("heading", { name: `환영합니다, ${testUser.nickname}님!` });
      expect(title).toHaveAttribute("data-order", "1");
    });
  });
});
