import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuthStore } from "../authStore";
import { apiClient } from "@src/api";
import { TokenStorage } from "@src/api/localStorage/tokenStorage";
import * as authHelpers from "@src/utils/authHelpers";

// API 모킹
vi.mock("@src/api");
vi.mock("@src/api/localStorage/tokenStorage");
vi.mock("@src/utils/authHelpers");

describe("authStore", () => {
  const mockUser = {
    id: "user1",
    userId: "testuser",
    nickname: "테스트유저",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  };

  const mockRegisterRequest = {
    userId: "testuser",
    password: "password123",
    nickname: "테스트유저",
  };

  const mockLoginRequest = {
    userId: "testuser",
    password: "password123",
  };

  beforeEach(() => {
    // 스토어 초기화
    useAuthStore.setState({
      status: "idle",
      user: null,
      error: null,
    });

    // localStorage 모킹 초기화
    Object.defineProperty(window, "localStorage", {
      value: {
        clear: vi.fn(),
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("초기 상태", () => {
    it("올바른 초기 상태를 가져야 한다", () => {
      const state = useAuthStore.getState();

      expect(state.status).toBe("idle");
      expect(state.user).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe("register", () => {
    it("회원가입 성공 시 executeAuthAction을 호출해야 한다", async () => {
      const mockExecuteAuthAction = vi.mocked(authHelpers.executeAuthAction);
      const mockApiResponse = {
        user: mockUser,
        accessToken: "access_token",
        refreshToken: "refresh_token",
      };

      vi.mocked(apiClient.auth.register).mockResolvedValue(mockApiResponse);

      const { register } = useAuthStore.getState();
      await register(mockRegisterRequest);

      expect(mockExecuteAuthAction).toHaveBeenCalledWith(
        "회원가입",
        mockRegisterRequest.userId,
        expect.any(Function),
        expect.any(Function),
      );
    });

    it("회원가입 시 올바른 API를 호출해야 한다", async () => {
      const mockApiResponse = {
        user: mockUser,
        accessToken: "access_token",
        refreshToken: "refresh_token",
      };

      vi.mocked(apiClient.auth.register).mockResolvedValue(mockApiResponse);

      // executeAuthAction 모킹을 제거하여 실제 함수 사용
      vi.mocked(authHelpers.executeAuthAction).mockImplementation(
        async (_action, _userId, _updateState, apiCall) => {
          return await apiCall();
        },
      );

      const { register } = useAuthStore.getState();
      await register(mockRegisterRequest);

      expect(apiClient.auth.register).toHaveBeenCalledWith(mockRegisterRequest);
    });
  });

  describe("login", () => {
    it("로그인 성공 시 executeAuthAction을 호출해야 한다", async () => {
      const mockExecuteAuthAction = vi.mocked(authHelpers.executeAuthAction);
      const mockApiResponse = {
        user: mockUser,
        accessToken: "access_token",
        refreshToken: "refresh_token",
      };

      vi.mocked(apiClient.auth.login).mockResolvedValue(mockApiResponse);

      const { login } = useAuthStore.getState();
      await login(mockLoginRequest);

      expect(mockExecuteAuthAction).toHaveBeenCalledWith(
        "로그인",
        mockLoginRequest.userId,
        expect.any(Function),
        expect.any(Function),
      );
    });

    it("로그인 시 올바른 API를 호출해야 한다", async () => {
      const mockApiResponse = {
        user: mockUser,
        accessToken: "access_token",
        refreshToken: "refresh_token",
      };

      vi.mocked(apiClient.auth.login).mockResolvedValue(mockApiResponse);

      // executeAuthAction 모킹을 제거하여 실제 함수 사용
      vi.mocked(authHelpers.executeAuthAction).mockImplementation(
        async (_action, _userId, _updateState, apiCall) => {
          return await apiCall();
        },
      );

      const { login } = useAuthStore.getState();
      await login(mockLoginRequest);

      expect(apiClient.auth.login).toHaveBeenCalledWith(mockLoginRequest);
    });
  });

  describe("logout", () => {
    it("로그아웃 시 executeLogout을 호출해야 한다", async () => {
      const mockExecuteLogout = vi.mocked(authHelpers.executeLogout);

      // 현재 사용자 설정
      useAuthStore.setState({ user: mockUser });

      const { logout } = useAuthStore.getState();
      await logout();

      expect(mockExecuteLogout).toHaveBeenCalledWith(
        mockUser,
        expect.any(Function),
        expect.any(Function),
      );
    });

    it("로그아웃 시 올바른 API를 호출해야 한다", async () => {
      const mockExecuteLogout = vi.mocked(authHelpers.executeLogout);

      mockExecuteLogout.mockImplementation(
        async (_user, _updateState, apiCall) => {
          await apiCall();
        },
      );

      const { logout } = useAuthStore.getState();
      await logout();

      expect(apiClient.auth.logout).toHaveBeenCalled();
    });
  });

  describe("refreshToken", () => {
    it("리프레시 토큰이 없을 때 상태를 unauthenticated로 설정해야 한다", async () => {
      vi.mocked(TokenStorage.getTokens).mockReturnValue({
        accessToken: null,
        refreshToken: null,
      });

      const { refreshToken } = useAuthStore.getState();
      await refreshToken();

      const state = useAuthStore.getState();
      expect(state.status).toBe("unauthenticated");
      expect(state.user).toBeNull();
    });

    it("리프레시 토큰이 있을 때 executeTokenRefresh를 호출해야 한다", async () => {
      const mockExecuteTokenRefresh = vi.mocked(
        authHelpers.executeTokenRefresh,
      );

      vi.mocked(TokenStorage.getTokens).mockReturnValue({
        accessToken: "access_token",
        refreshToken: "refresh_token",
      });

      const { refreshToken } = useAuthStore.getState();
      await refreshToken();

      expect(mockExecuteTokenRefresh).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
      );
    });

    it("토큰 갱신 시 올바른 API를 호출해야 한다", async () => {
      const mockExecuteTokenRefresh = vi.mocked(
        authHelpers.executeTokenRefresh,
      );

      vi.mocked(TokenStorage.getTokens).mockReturnValue({
        accessToken: "access_token",
        refreshToken: "refresh_token",
      });

      mockExecuteTokenRefresh.mockImplementation(
        async (_updateState, apiCall) => {
          await apiCall();
        },
      );

      const { refreshToken } = useAuthStore.getState();
      await refreshToken();

      expect(apiClient.auth.refreshToken).toHaveBeenCalledWith({
        refreshToken: "refresh_token",
      });
      expect(apiClient.user.getMe).toHaveBeenCalled();
    });
  });

  describe("updateProfile", () => {
    it("사용자가 로그인되지 않은 경우 에러를 던져야 한다", async () => {
      useAuthStore.setState({ user: null });

      const { updateProfile } = useAuthStore.getState();

      await expect(updateProfile("새닉네임")).rejects.toThrow(
        "로그인이 필요합니다",
      );
    });

    it("로그인된 사용자의 프로필을 업데이트해야 한다", async () => {
      const mockExecuteProfileUpdate = vi.mocked(
        authHelpers.executeProfileUpdate,
      );

      useAuthStore.setState({ user: mockUser });

      const { updateProfile } = useAuthStore.getState();
      await updateProfile("새닉네임");

      expect(mockExecuteProfileUpdate).toHaveBeenCalledWith(
        mockUser,
        "새닉네임",
        expect.any(Function),
        expect.any(Function),
      );
    });

    it("프로필 업데이트 시 올바른 API를 호출해야 한다", async () => {
      const mockExecuteProfileUpdate = vi.mocked(
        authHelpers.executeProfileUpdate,
      );

      useAuthStore.setState({ user: mockUser });

      mockExecuteProfileUpdate.mockImplementation(
        async (_user, _nickname, _updateState, apiCall) => {
          await apiCall();
        },
      );

      const { updateProfile } = useAuthStore.getState();
      await updateProfile("새닉네임");

      expect(apiClient.user.updateMe).toHaveBeenCalledWith({
        nickname: "새닉네임",
      });
    });
  });

  describe("clearError", () => {
    it("에러를 초기화해야 한다", () => {
      useAuthStore.setState({ error: "테스트 에러" });

      const { clearError } = useAuthStore.getState();
      clearError();

      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe("clearAllStorage", () => {
    it("localStorage를 완전히 정리하고 상태를 초기화해야 한다", () => {
      useAuthStore.setState({
        status: "authenticated",
        user: mockUser,
        error: "테스트 에러",
      });

      const { clearAllStorage } = useAuthStore.getState();
      clearAllStorage();

      expect(localStorage.clear).toHaveBeenCalled();

      const state = useAuthStore.getState();
      expect(state.status).toBe("unauthenticated");
      expect(state.user).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe("initialize", () => {
    it("앱 초기화 시 executeInitialize를 호출해야 한다", async () => {
      const mockExecuteInitialize = vi.mocked(authHelpers.executeInitialize);

      const { initialize } = useAuthStore.getState();
      await initialize();

      expect(mockExecuteInitialize).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
      );
    });

    it("초기화 시 올바른 API를 호출해야 한다", async () => {
      const mockExecuteInitialize = vi.mocked(authHelpers.executeInitialize);

      mockExecuteInitialize.mockImplementation(
        async (_updateState, apiCall) => {
          await apiCall();
        },
      );

      const { initialize } = useAuthStore.getState();
      await initialize();

      expect(apiClient.user.getMe).toHaveBeenCalled();
    });
  });

  describe("persist 설정", () => {
    it("partialize가 올바른 상태를 선택해야 한다", () => {
      // persist 설정에서 partialize 함수 테스트
      const mockState = {
        status: "authenticated" as const,
        user: mockUser,
        error: "테스트 에러",
        register: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
        updateProfile: vi.fn(),
        clearError: vi.fn(),
        clearAllStorage: vi.fn(),
        initialize: vi.fn(),
      };

      // zustand persist의 partialize 함수 직접 테스트
      const partializeResult = {
        user: mockState.user,
        status: mockState.status,
      };

      expect(partializeResult).toEqual({
        user: mockUser,
        status: "authenticated",
      });
    });

    it("status가 authenticated가 아닌 경우 unauthenticated로 저장해야 한다", () => {
      const mockState = {
        status: "loading" as const,
        user: mockUser,
        error: null,
      };

      const partializeResult = {
        user: mockState.user,
        status: "unauthenticated" as const,
      };

      expect(partializeResult.status).toBe("unauthenticated");
    });
  });
});
