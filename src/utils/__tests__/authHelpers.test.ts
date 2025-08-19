import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedFunction,
} from "vitest";
import type { User } from "@src/types/user";
import type { ApiError } from "@src/types/api";
import {
  executeAuthAction,
  executeLogout,
  executeProfileUpdate,
  executeTokenRefresh,
  executeInitialize,
  type AuthStateUpdater,
} from "../authHelpers";

// logger 모킹 - 단순하게 처리
vi.mock("@src/utils/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
  createUserMetadata: vi.fn((userId, metadata) => ({ userId, ...metadata })),
}));

// localStorage 모킹
const mockLocalStorage = {
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("authHelpers", () => {
  // 테스트용 데이터
  const mockUser: User = {
    id: "user-123",
    userId: "testuser",
    nickname: "테스트유저",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUpdatedUser: User = {
    ...mockUser,
    nickname: "업데이트된유저",
  };

  const mockApiError: ApiError = {
    detailCode: "TEST_ERROR",
    message: "테스트 에러 메시지",
  };

  // Mock 함수들
  let mockSetState: MockedFunction<AuthStateUpdater>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetState = vi.fn();
  });

  describe("executeAuthAction", () => {
    it("성공적인 인증 액션을 처리해야 한다", async () => {
      const mockAction = vi.fn().mockResolvedValue({
        user: mockUser,
        successMessage: "로그인 성공",
      });

      const result = await executeAuthAction(
        "로그인",
        "testuser",
        mockSetState,
        mockAction
      );

      // 결과 검증
      expect(result).toEqual({
        user: mockUser,
        successMessage: "로그인 성공",
      });

      // setState 호출 검증
      expect(mockSetState).toHaveBeenCalledTimes(2);
      expect(mockSetState).toHaveBeenNthCalledWith(1, {
        status: "loading",
        error: null,
      });
      expect(mockSetState).toHaveBeenNthCalledWith(2, {
        status: "authenticated",
        user: mockUser,
        error: null,
      });
    });

    it("user가 없는 경우를 처리해야 한다", async () => {
      const mockAction = vi.fn().mockResolvedValue({
        successMessage: "작업 성공",
      });

      const result = await executeAuthAction(
        "작업",
        undefined,
        mockSetState,
        mockAction
      );

      expect(result).toEqual({
        successMessage: "작업 성공",
      });

      expect(mockSetState).toHaveBeenNthCalledWith(2, {
        status: "authenticated",
        user: null,
        error: null,
      });
    });

    it("실패한 인증 액션을 처리해야 한다", async () => {
      const mockAction = vi.fn().mockRejectedValue(mockApiError);

      await expect(
        executeAuthAction("로그인", "testuser", mockSetState, mockAction)
      ).rejects.toThrow();

      // setState 호출 검증
      expect(mockSetState).toHaveBeenCalledTimes(2);
      expect(mockSetState).toHaveBeenNthCalledWith(1, {
        status: "loading",
        error: null,
      });
      expect(mockSetState).toHaveBeenNthCalledWith(2, {
        status: "unauthenticated",
        user: null,
        error: "테스트 에러 메시지",
      });
    });

    it("에러 메시지가 없는 경우 기본 메시지를 사용해야 한다", async () => {
      const errorWithoutMessage = { detailCode: "TEST_ERROR" } as ApiError;
      const mockAction = vi.fn().mockRejectedValue(errorWithoutMessage);

      await expect(
        executeAuthAction("로그인", "testuser", mockSetState, mockAction)
      ).rejects.toThrow();

      expect(mockSetState).toHaveBeenNthCalledWith(2, {
        status: "unauthenticated",
        user: null,
        error: "로그인에 실패했습니다",
      });
    });
  });

  describe("executeLogout", () => {
    it("성공적인 로그아웃을 처리해야 한다", async () => {
      const mockLogoutAction = vi.fn().mockResolvedValue(undefined);

      await executeLogout(mockUser, mockSetState, mockLogoutAction);

      // 로그아웃 액션 호출 검증
      expect(mockLogoutAction).toHaveBeenCalledTimes(1);

      // localStorage 정리 검증
      expect(mockLocalStorage.clear).toHaveBeenCalledTimes(1);

      // 상태 설정 검증
      expect(mockSetState).toHaveBeenCalledWith({
        status: "unauthenticated",
        user: null,
        error: null,
      });
    });

    it("로그아웃 에러가 발생해도 상태를 정리해야 한다", async () => {
      const mockError = new Error("로그아웃 에러");
      const mockLogoutAction = vi.fn().mockRejectedValue(mockError);

      await executeLogout(mockUser, mockSetState, mockLogoutAction);

      // localStorage는 여전히 정리되어야 함
      expect(mockLocalStorage.clear).toHaveBeenCalledTimes(1);

      // 상태는 여전히 설정되어야 함
      expect(mockSetState).toHaveBeenCalledWith({
        status: "unauthenticated",
        user: null,
        error: null,
      });
    });

    it("currentUser가 null인 경우를 처리해야 한다", async () => {
      const mockLogoutAction = vi.fn().mockResolvedValue(undefined);

      await executeLogout(null, mockSetState, mockLogoutAction);

      expect(mockLocalStorage.clear).toHaveBeenCalledTimes(1);
      expect(mockSetState).toHaveBeenCalledWith({
        status: "unauthenticated",
        user: null,
        error: null,
      });
    });
  });

  describe("executeProfileUpdate", () => {
    it("성공적인 프로필 업데이트를 처리해야 한다", async () => {
      const mockUpdateAction = vi.fn().mockResolvedValue(mockUpdatedUser);

      await executeProfileUpdate(
        mockUser,
        "업데이트된유저",
        mockSetState,
        mockUpdateAction
      );

      // 업데이트 액션 호출 검증
      expect(mockUpdateAction).toHaveBeenCalledTimes(1);

      // 상태 업데이트 검증
      expect(mockSetState).toHaveBeenCalledWith({
        user: mockUpdatedUser,
        error: null,
      });
    });

    it("실패한 프로필 업데이트를 처리해야 한다", async () => {
      const mockUpdateAction = vi.fn().mockRejectedValue(mockApiError);

      await expect(
        executeProfileUpdate(
          mockUser,
          "업데이트된유저",
          mockSetState,
          mockUpdateAction
        )
      ).rejects.toThrow();

      // 에러 상태 설정 검증
      expect(mockSetState).toHaveBeenCalledWith({
        error: "테스트 에러 메시지",
      });
    });

    it("에러 메시지가 없는 경우 기본 메시지를 사용해야 한다", async () => {
      const errorWithoutMessage = { detailCode: "TEST_ERROR" } as ApiError;
      const mockUpdateAction = vi.fn().mockRejectedValue(errorWithoutMessage);

      await expect(
        executeProfileUpdate(
          mockUser,
          "업데이트된유저",
          mockSetState,
          mockUpdateAction
        )
      ).rejects.toThrow();

      expect(mockSetState).toHaveBeenCalledWith({
        error: "프로필 업데이트에 실패했습니다",
      });
    });
  });

  describe("executeTokenRefresh", () => {
    it("성공적인 토큰 갱신을 처리해야 한다", async () => {
      const mockRefreshAction = vi.fn().mockResolvedValue(mockUser);

      await executeTokenRefresh(mockSetState, mockRefreshAction);

      // 새로고침 액션 호출 검증
      expect(mockRefreshAction).toHaveBeenCalledTimes(1);

      // 상태 업데이트 검증
      expect(mockSetState).toHaveBeenCalledWith({
        status: "authenticated",
        user: mockUser,
        error: null,
      });
    });

    it("실패한 토큰 갱신을 처리해야 한다", async () => {
      const mockError = new Error("토큰 갱신 실패");
      const mockRefreshAction = vi.fn().mockRejectedValue(mockError);

      await expect(
        executeTokenRefresh(mockSetState, mockRefreshAction)
      ).rejects.toThrow();

      // 상태 업데이트 검증
      expect(mockSetState).toHaveBeenCalledWith({
        status: "unauthenticated",
        user: null,
        error: null,
      });
    });
  });

  describe("executeInitialize", () => {
    it("성공적인 초기화를 처리해야 한다", async () => {
      const mockGetMeAction = vi.fn().mockResolvedValue(mockUser);

      await executeInitialize(mockSetState, mockGetMeAction);

      // getMeAction 호출 검증
      expect(mockGetMeAction).toHaveBeenCalledTimes(1);

      // 상태 업데이트 검증
      expect(mockSetState).toHaveBeenCalledTimes(2);
      expect(mockSetState).toHaveBeenNthCalledWith(1, { status: "loading" });
      expect(mockSetState).toHaveBeenNthCalledWith(2, {
        status: "authenticated",
        user: mockUser,
        error: null,
      });
    });

    it("인증 정보가 없는 경우를 처리해야 한다", async () => {
      const mockError = new Error("인증 정보 없음");
      const mockGetMeAction = vi.fn().mockRejectedValue(mockError);

      await executeInitialize(mockSetState, mockGetMeAction);

      // 상태 업데이트 검증
      expect(mockSetState).toHaveBeenCalledTimes(2);
      expect(mockSetState).toHaveBeenNthCalledWith(1, { status: "loading" });
      expect(mockSetState).toHaveBeenNthCalledWith(2, {
        status: "unauthenticated",
        user: null,
        error: null,
      });
    });

    it("JSON 파싱 에러 시 localStorage를 정리해야 한다", async () => {
      const mockError = new Error("JSON parse error - not valid JSON");
      const mockGetMeAction = vi.fn().mockRejectedValue(mockError);

      await executeInitialize(mockSetState, mockGetMeAction);

      // localStorage 정리 검증
      expect(mockLocalStorage.clear).toHaveBeenCalledTimes(1);
    });

    it("다양한 JSON 에러 패턴을 감지해야 한다", async () => {
      const jsonErrorPatterns = [
        "JSON parse error",
        "not valid JSON format",
        "Invalid JSON data",
      ];

      for (const errorMessage of jsonErrorPatterns) {
        vi.clearAllMocks();
        const mockError = new Error(errorMessage);
        const mockGetMeAction = vi.fn().mockRejectedValue(mockError);

        await executeInitialize(mockSetState, mockGetMeAction);

        expect(mockLocalStorage.clear).toHaveBeenCalledTimes(1);
      }
    });
  });
});
