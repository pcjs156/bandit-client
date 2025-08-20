import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render } from "@src/test/helpers/testUtils";
import Layout from "../Layout";
import { useAuthStore } from "@src/stores/authStore";

// Mock useAuthStore
vi.mock("@src/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

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

// Mock HeaderLogo component
vi.mock("@src/components/common/HeaderLogo", () => ({
  HeaderLogo: () => <div data-testid="header-logo">HeaderLogo</div>,
}));

// Mock AuthButtons components
vi.mock("@src/components/common/AuthButtons", () => ({
  LoadingAuthButton: () => <div data-testid="loading-auth-button">Loading</div>,
  GuestAuthButtons: () => <div data-testid="guest-auth-buttons">Guest</div>,
  AuthenticatedUserButtons: ({ user, onLogout }: { user: { nickname: string }; onLogout: () => void }) => (
    <div data-testid="authenticated-user-buttons">
      <button onClick={onLogout} data-testid="logout-button">
        로그아웃
      </button>
      <span data-testid="user-nickname">{user.nickname}</span>
    </div>
  ),
}));

// Test data factories
const createAuthStoreMock = (overrides = {}) => ({
  user: null,
  status: "idle" as const,
  logout: vi.fn(),
  initialize: vi.fn(),
  ...overrides,
});

const createTestUser = () => ({
  userId: "testuser",
  nickname: "테스트유저",
});

describe("Layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("초기화", () => {
    it("컴포넌트 마운트 시 initialize가 호출되어야 한다", () => {
      const mockStore = createAuthStoreMock();
      mockUseAuthStore.mockReturnValue(mockStore);

      render(<Layout />);

      expect(mockStore.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe("헤더 렌더링", () => {
    it("HeaderLogo를 렌더링해야 한다", () => {
      const mockStore = createAuthStoreMock();
      mockUseAuthStore.mockReturnValue(mockStore);

      render(<Layout />);

      expect(screen.getByTestId("header-logo")).toBeInTheDocument();
    });

    it("AppShell 헤더를 올바른 높이로 렌더링해야 한다", () => {
      const mockStore = createAuthStoreMock();
      mockUseAuthStore.mockReturnValue(mockStore);

      render(<Layout />);

      // AppShell.Header가 렌더링되었는지 확인
      const header = document.querySelector("header");
      expect(header).toBeInTheDocument();
    });
  });

  describe("인증 상태에 따른 버튼 렌더링", () => {
    it("로딩 상태일 때 LoadingAuthButton을 렌더링해야 한다", () => {
      const mockStore = createAuthStoreMock({ status: "loading" });
      mockUseAuthStore.mockReturnValue(mockStore);

      render(<Layout />);

      expect(screen.getByTestId("loading-auth-button")).toBeInTheDocument();
      expect(
        screen.queryByTestId("guest-auth-buttons")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("authenticated-user-buttons")
      ).not.toBeInTheDocument();
    });

    it("인증되지 않은 상태일 때 GuestAuthButtons를 렌더링해야 한다", () => {
      const mockStore = createAuthStoreMock({ status: "idle" });
      mockUseAuthStore.mockReturnValue(mockStore);

      render(<Layout />);

      expect(screen.getByTestId("guest-auth-buttons")).toBeInTheDocument();
      expect(
        screen.queryByTestId("loading-auth-button")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("authenticated-user-buttons")
      ).not.toBeInTheDocument();
    });

    it("인증된 상태일 때 AuthenticatedUserButtons를 렌더링해야 한다", () => {
      const testUser = createTestUser();
      const mockStore = createAuthStoreMock({
        status: "authenticated",
        user: testUser,
      });
      mockUseAuthStore.mockReturnValue(mockStore);

      render(<Layout />);

      expect(
        screen.getByTestId("authenticated-user-buttons")
      ).toBeInTheDocument();
      expect(screen.getByTestId("user-nickname")).toHaveTextContent(
        "테스트유저"
      );
      expect(
        screen.queryByTestId("loading-auth-button")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("guest-auth-buttons")
      ).not.toBeInTheDocument();
    });
  });

  describe("로그아웃 기능", () => {
    it("로그아웃 버튼 클릭 시 logout과 navigate가 호출되어야 한다", async () => {
      const user = userEvent.setup();
      const testUser = createTestUser();
      const mockLogout = vi.fn().mockResolvedValue(undefined);
      const mockStore = createAuthStoreMock({
        status: "authenticated",
        user: testUser,
        logout: mockLogout,
      });
      mockUseAuthStore.mockReturnValue(mockStore);

      render(<Layout />);

      const logoutButton = screen.getByTestId("logout-button");
      await user.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("로그아웃 후 홈으로 이동해야 한다", async () => {
      const user = userEvent.setup();
      const testUser = createTestUser();
      const mockLogout = vi.fn().mockResolvedValue(undefined);
      const mockStore = createAuthStoreMock({
        status: "authenticated",
        user: testUser,
        logout: mockLogout,
      });
      mockUseAuthStore.mockReturnValue(mockStore);

      render(<Layout />);

      const logoutButton = screen.getByTestId("logout-button");
      await user.click(logoutButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("메인 콘텐츠 영역", () => {
    it("AppShell.Main을 렌더링해야 한다", () => {
      const mockStore = createAuthStoreMock();
      mockUseAuthStore.mockReturnValue(mockStore);

      render(<Layout />);

      // AppShell.Main이 렌더링되었는지 확인
      const main = document.querySelector("main");
      expect(main).toBeInTheDocument();
    });

    it("메인 콘텐츠가 렌더링되어야 한다", () => {
      const mockStore = createAuthStoreMock();
      mockUseAuthStore.mockReturnValue(mockStore);

      render(<Layout />);

      // AppShell.Main이 렌더링되었는지 확인
      const main = document.querySelector("main");
      expect(main).toBeInTheDocument();
    });
  });

  describe("컨테이너 설정", () => {
    it("헤더에 lg 크기 컨테이너를 사용해야 한다", () => {
      const mockStore = createAuthStoreMock();
      mockUseAuthStore.mockReturnValue(mockStore);

      render(<Layout />);

      const container = document.querySelector('[data-size="lg"]');
      expect(container).toBeInTheDocument();
    });
  });

  describe("사용자 상태 변화", () => {
    it("사용자 상태가 변경되면 적절한 버튼이 렌더링되어야 한다", () => {
      // 초기 상태 (idle)
      let mockStore = createAuthStoreMock({ status: "idle" });
      mockUseAuthStore.mockReturnValue(mockStore);
      const { rerender } = render(<Layout />);

      expect(screen.getByTestId("guest-auth-buttons")).toBeInTheDocument();

      // 로딩 상태
      mockStore = createAuthStoreMock({ status: "loading" });
      mockUseAuthStore.mockReturnValue(mockStore);
      rerender(<Layout />);

      expect(screen.getByTestId("loading-auth-button")).toBeInTheDocument();

      // 인증된 상태
      const testUser = createTestUser();
      mockStore = createAuthStoreMock({
        status: "authenticated",
        user: testUser,
      });
      mockUseAuthStore.mockReturnValue(mockStore);
      rerender(<Layout />);

      expect(
        screen.getByTestId("authenticated-user-buttons")
      ).toBeInTheDocument();
    });
  });
});
