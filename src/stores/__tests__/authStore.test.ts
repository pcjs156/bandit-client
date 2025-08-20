import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useAuthStore } from "../authStore";
import {
  TestDataFactory,
  setupCommonTestEnvironment,
} from "@src/test/helpers/commonTestHelpers";

// API 모킹
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

// 유틸리티 함수 모킹
vi.mock("@src/utils/authHelpers", () => ({
  executeAuthAction: vi.fn(),
  executeLogout: vi.fn(),
  executeProfileUpdate: vi.fn(),
  executeTokenRefresh: vi.fn(),
  executeInitialize: vi.fn(),
}));

// TokenStorage 모킹
vi.mock("@src/api/localStorage/tokenStorage", () => ({
  TokenStorage: {
    getTokens: vi.fn(() => ({
      accessToken: "mock-access",
      refreshToken: "mock-refresh",
    })),
  },
}));

describe("authStore", () => {
  const mockUser = TestDataFactory.createUser();
  const mockRegisterRequest = TestDataFactory.createRegisterRequest();
  const mockLoginRequest = TestDataFactory.createLoginRequest();

  // 공통 테스트 환경 설정
  setupCommonTestEnvironment();

  beforeEach(() => {
    // 스토어 초기화
    useAuthStore.setState({
      status: "idle",
      user: null,
      error: null,
    });

    // 모킹된 함수들 초기화
    vi.clearAllMocks();
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
    it("회원가입을 성공적으로 처리해야 한다", async () => {
      const { register } = useAuthStore.getState();

      // register 함수가 정의되어 있는지 확인
      expect(typeof register).toBe("function");

      // 함수 실행 시 에러가 발생하지 않아야 함
      await expect(register(mockRegisterRequest)).resolves.not.toThrow();
    });
  });

  describe("login", () => {
    it("로그인을 성공적으로 처리해야 한다", async () => {
      const { login } = useAuthStore.getState();

      // login 함수가 정의되어 있는지 확인
      expect(typeof login).toBe("function");

      // 함수 실행 시 에러가 발생하지 않아야 함
      await expect(login(mockLoginRequest)).resolves.not.toThrow();
    });
  });

  describe("logout", () => {
    it("로그아웃을 성공적으로 처리해야 한다", async () => {
      const { logout } = useAuthStore.getState();

      // logout 함수가 정의되어 있는지 확인
      expect(typeof logout).toBe("function");

      // 함수 실행 시 에러가 발생하지 않아야 함
      await expect(logout()).resolves.not.toThrow();
    });
  });

  describe("refreshToken", () => {
    it("토큰 갱신을 성공적으로 처리해야 한다", async () => {
      const { refreshToken } = useAuthStore.getState();

      // refreshToken 함수가 정의되어 있는지 확인
      expect(typeof refreshToken).toBe("function");

      // 함수 실행 시 에러가 발생하지 않아야 함
      await expect(refreshToken()).resolves.not.toThrow();
    });
  });

  describe("updateProfile", () => {
    it("프로필 업데이트를 성공적으로 처리해야 한다", async () => {
      const { updateProfile } = useAuthStore.getState();

      // 먼저 사용자를 로그인 상태로 설정
      useAuthStore.setState({ user: mockUser });

      // updateProfile 함수가 정의되어 있는지 확인
      expect(typeof updateProfile).toBe("function");

      // 함수 실행 시 에러가 발생하지 않아야 함
      await expect(updateProfile("새닉네임")).resolves.not.toThrow();
    });

    it("로그인하지 않은 상태에서 프로필 업데이트 시 에러를 던져야 한다", async () => {
      const { updateProfile } = useAuthStore.getState();

      // 사용자가 로그인하지 않은 상태
      useAuthStore.setState({ user: null });

      // 에러가 발생해야 함
      await expect(updateProfile("새닉네임")).rejects.toThrow(
        "로그인이 필요합니다"
      );
    });
  });

  describe("initialize", () => {
    it("초기화를 성공적으로 처리해야 한다", async () => {
      const { initialize } = useAuthStore.getState();

      // initialize 함수가 정의되어 있는지 확인
      expect(typeof initialize).toBe("function");

      // 함수 실행 시 에러가 발생하지 않아야 함
      await expect(initialize()).resolves.not.toThrow();
    });
  });

  describe("상태 변화", () => {
    it("에러를 초기화할 수 있어야 한다", () => {
      const { clearError } = useAuthStore.getState();

      // 에러 상태 설정
      useAuthStore.setState({ error: "테스트 에러" });

      // 에러가 설정되었는지 확인
      expect(useAuthStore.getState().error).toBe("테스트 에러");

      // 에러 초기화
      clearError();

      // 에러가 초기화되었는지 확인
      expect(useAuthStore.getState().error).toBeNull();
    });

    it("사용자 정보가 올바르게 설정되어야 한다", () => {
      // 사용자 설정
      useAuthStore.setState({ user: mockUser });

      // 사용자가 설정되었는지 확인
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });
  });

  describe("에러 처리", () => {
    it("에러를 초기화할 수 있어야 한다", () => {
      const { clearError } = useAuthStore.getState();

      // 에러 상태 설정
      useAuthStore.setState({ error: "테스트 에러" });

      // 에러 초기화
      clearError();

      // 에러가 초기화되었는지 확인
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe("유틸리티 함수들", () => {
    it("clearAllStorage가 올바르게 동작해야 한다", () => {
      const { clearAllStorage } = useAuthStore.getState();

      // 사용자와 에러 상태 설정
      useAuthStore.setState({
        user: mockUser,
        error: "테스트 에러",
        status: "authenticated",
      });

      // 상태가 설정되었는지 확인
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().error).toBe("테스트 에러");
      expect(useAuthStore.getState().status).toBe("authenticated");

      // 모든 스토리지 정리
      clearAllStorage();

      // 상태가 초기화되었는지 확인
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().error).toBeNull();
      expect(useAuthStore.getState().status).toBe("unauthenticated");
    });
  });
});
