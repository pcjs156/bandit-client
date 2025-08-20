import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "../authStore";
import type { RegisterRequest, LoginRequest } from "@src/types/api";
import type { User } from "@src/types/user";

// Mock dependencies
vi.mock("@src/api", () => ({
  apiClient: {
    auth: {
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
    },
    user: {
      getMe: vi.fn(),
      updateMe: vi.fn(),
    },
  },
}));

vi.mock("@src/api/localStorage/tokenStorage", () => ({
  TokenStorage: {
    getTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

vi.mock("@src/utils/authHelpers", () => ({
  executeAuthAction: vi.fn(),
  executeLogout: vi.fn(),
  executeProfileUpdate: vi.fn(),
  executeTokenRefresh: vi.fn(),
  executeInitialize: vi.fn(),
}));

describe("useAuthStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAuthStore());
    result.current.clearAllStorage();
  });

  it("초기 상태가 올바르게 설정되어야 한다", () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.status).toBe("unauthenticated");
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("register 함수가 올바르게 동작해야 한다", async () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser: User = { 
      id: "1", 
      userId: "test", 
      nickname: "Test User",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    };
    const mockResponse = { user: mockUser, accessToken: "token", refreshToken: "refresh" };

    const { executeAuthAction } = await import("@src/utils/authHelpers");
    vi.mocked(executeAuthAction).mockResolvedValue(mockResponse);

    const registerData: RegisterRequest = {
      userId: "test",
      password: "password",
      nickname: "Test User"
    };

    await act(async () => {
      await result.current.register(registerData);
    });

    expect(executeAuthAction).toHaveBeenCalledWith("회원가입", "test", expect.any(Function), expect.any(Function));
  });

  it("login 함수가 올바르게 동작해야 한다", async () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser: User = { 
      id: "1", 
      userId: "test", 
      nickname: "Test User",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    };
    const mockResponse = { user: mockUser, accessToken: "token", refreshToken: "refresh" };

    const { executeAuthAction } = await import("@src/utils/authHelpers");
    vi.mocked(executeAuthAction).mockResolvedValue(mockResponse);

    const loginData: LoginRequest = {
      userId: "test",
      password: "password"
    };

    await act(async () => {
      await result.current.login(loginData);
    });

    expect(executeAuthAction).toHaveBeenCalledWith("로그인", "test", expect.any(Function), expect.any(Function));
  });

  it("logout 함수가 올바르게 동작해야 한다", async () => {
    const { result } = renderHook(() => useAuthStore());
    
    const { executeLogout } = await import("@src/utils/authHelpers");
    vi.mocked(executeLogout).mockResolvedValue(undefined);

    await act(async () => {
      await result.current.logout();
    });

    expect(executeLogout).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Function));
  });

  it("updateProfile 함수가 올바르게 동작해야 한다", async () => {
    const { result } = renderHook(() => useAuthStore());
    
    // 먼저 로그인 상태로 만듦 - executeAuthAction을 모킹하여 사용자 상태 설정
    const mockUser: User = { 
      id: "1", 
      userId: "test", 
      nickname: "Test User",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    };
    
    const { executeAuthAction } = await import("@src/utils/authHelpers");
    vi.mocked(executeAuthAction).mockImplementation(async (actionName, userId, setState, action) => {
      // 사용자 상태를 설정
      setState({
        status: "authenticated",
        user: mockUser,
        error: null,
      });
      return { user: mockUser, successMessage: "로그인 성공" };
    });
    
    // 로그인 실행하여 사용자 상태 설정
    const loginData: LoginRequest = {
      userId: "test",
      password: "password"
    };
    
    await act(async () => {
      await result.current.login(loginData);
    });
    
    // 이제 updateProfile 테스트
    const { executeProfileUpdate } = await import("@src/utils/authHelpers");
    vi.mocked(executeProfileUpdate).mockResolvedValue(undefined);

    await act(async () => {
      await result.current.updateProfile("New Nickname");
    });

    expect(executeProfileUpdate).toHaveBeenCalledWith(mockUser, "New Nickname", expect.any(Function), expect.any(Function));
  });

  it("refreshToken 함수가 올바르게 동작해야 한다", async () => {
    const { result } = renderHook(() => useAuthStore());
    
    // TokenStorage.getTokens 모킹
    const { TokenStorage } = await import("@src/api/localStorage/tokenStorage");
    vi.mocked(TokenStorage.getTokens).mockReturnValue({
      accessToken: "access-token",
      refreshToken: "refresh-token"
    });
    
    const { executeTokenRefresh } = await import("@src/utils/authHelpers");
    vi.mocked(executeTokenRefresh).mockResolvedValue(undefined);

    await act(async () => {
      await result.current.refreshToken();
    });

    expect(executeTokenRefresh).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
  });

  it("initialize 함수가 올바르게 동작해야 한다", async () => {
    const { result } = renderHook(() => useAuthStore());
    
    const { executeInitialize } = await import("@src/utils/authHelpers");
    vi.mocked(executeInitialize).mockResolvedValue(undefined);

    await act(async () => {
      await result.current.initialize();
    });

    expect(executeInitialize).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
  });

  it("clearAllStorage 함수가 올바르게 동작해야 한다", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.clearAllStorage();
    });

    expect(result.current.status).toBe("unauthenticated");
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
