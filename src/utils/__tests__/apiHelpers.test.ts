import { describe, it, expect, beforeEach, vi } from "vitest";
import type { StoredUser } from "@src/stores/userStore";
import type { User } from "@src/types/user";
import { ApiErrorCode } from "@src/types/api";
import {
  createApiError,
  ERROR_MESSAGES,
  findAndValidateUser,
  validateUserIdNotExists,
  validatePassword,
  generateAndStoreTokens,
  authenticateUser,
  createAuthResponse,
  toPublicUser,
  validateAndParseRefreshToken,
  findUserByIdForRefresh,
} from "../apiHelpers";

// 외부 의존성 모킹
vi.mock("@src/stores/userStore", () => ({
  useUserStore: {
    getState: vi.fn(),
  },
}));

vi.mock("@src/api/localStorage/tokenStorage", () => ({
  TokenStorage: {
    generateTokens: vi.fn(),
    setTokens: vi.fn(),
    parseToken: vi.fn(),
  },
}));

// 모킹된 모듈들 가져오기
import { useUserStore } from "@src/stores/userStore";
import { TokenStorage } from "@src/api/localStorage/tokenStorage";

// 타입 단언
const mockUseUserStore = useUserStore as { getState: ReturnType<typeof vi.fn> };
const mockTokenStorage = TokenStorage as {
  generateTokens: ReturnType<typeof vi.fn>;
  setTokens: ReturnType<typeof vi.fn>;
  parseToken: ReturnType<typeof vi.fn>;
};

describe("apiHelpers", () => {
  // 테스트용 데이터
  const mockUser: User = {
    id: "user-123",
    userId: "testuser",
    nickname: "테스트유저",
    createdAt: new Date().toISOString(),
  };

  const mockStoredUser: StoredUser = {
    ...mockUser,
    passwordHash: "hashedPassword123",
  };

  const mockTokens = {
    accessToken: "access-token-123",
    refreshToken: "refresh-token-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createApiError", () => {
    it("올바른 형태의 API 에러 객체를 생성해야 한다", () => {
      const error = createApiError("TEST_CODE", "테스트 메시지");

      expect(error).toEqual({
        detailCode: "TEST_CODE",
        message: "테스트 메시지",
      });
    });

    it("빈 문자열도 올바르게 처리해야 한다", () => {
      const error = createApiError("", "");

      expect(error).toEqual({
        detailCode: "",
        message: "",
      });
    });
  });

  describe("ERROR_MESSAGES", () => {
    it("모든 에러 메시지가 정의되어 있어야 한다", () => {
      expect(ERROR_MESSAGES.USER_ALREADY_EXISTS).toBe(
        "이미 사용중인 아이디입니다"
      );
      expect(ERROR_MESSAGES.INVALID_CREDENTIALS).toBe(
        "아이디 또는 비밀번호가 잘못되었습니다"
      );
      expect(ERROR_MESSAGES.INVALID_REFRESH_TOKEN).toBe("다시 로그인해주세요");
    });

    it("상수 객체로 정의되어 있어야 한다", () => {
      // as const로 정의된 객체는 타입스크립트 레벨에서 readonly이지만
      // 런타임에서는 실제로 변경 가능하므로, 타입 체크만 확인
      expect(typeof ERROR_MESSAGES).toBe("object");
      expect(ERROR_MESSAGES).toBeDefined();
    });
  });

  describe("findAndValidateUser", () => {
    it("사용자가 존재할 때 해당 사용자를 반환해야 한다", () => {
      // Mock 설정
      mockUseUserStore.getState.mockReturnValue({
        findUserByUserId: vi.fn().mockReturnValue(mockStoredUser),
      });

      const result = findAndValidateUser("testuser");

      expect(result).toEqual(mockStoredUser);
      expect(mockUseUserStore.getState().findUserByUserId).toHaveBeenCalledWith(
        "testuser"
      );
    });

    it("사용자가 존재하지 않을 때 에러를 던져야 한다", () => {
      // Mock 설정
      mockUseUserStore.getState.mockReturnValue({
        findUserByUserId: vi.fn().mockReturnValue(null),
      });

      expect(() => findAndValidateUser("nonexistent")).toThrow();

      try {
        findAndValidateUser("nonexistent");
      } catch (error: any) {
        expect(error.detailCode).toBe(ApiErrorCode.INVALID_CREDENTIALS);
        expect(error.message).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    });
  });

  describe("validateUserIdNotExists", () => {
    it("사용자가 존재하지 않을 때 에러를 던지지 않아야 한다", () => {
      // Mock 설정
      mockUseUserStore.getState.mockReturnValue({
        findUserByUserId: vi.fn().mockReturnValue(null),
      });

      expect(() => validateUserIdNotExists("newuser")).not.toThrow();
    });

    it("사용자가 이미 존재할 때 에러를 던져야 한다", () => {
      // Mock 설정
      mockUseUserStore.getState.mockReturnValue({
        findUserByUserId: vi.fn().mockReturnValue(mockStoredUser),
      });

      expect(() => validateUserIdNotExists("testuser")).toThrow();

      try {
        validateUserIdNotExists("testuser");
      } catch (error: any) {
        expect(error.detailCode).toBe(ApiErrorCode.USER_ID_ALREADY_EXISTS);
        expect(error.message).toBe(ERROR_MESSAGES.USER_ALREADY_EXISTS);
      }
    });
  });

  describe("validatePassword", () => {
    it("비밀번호가 올바를 때 에러를 던지지 않아야 한다", async () => {
      // Mock 설정
      mockUseUserStore.getState.mockReturnValue({
        verifyPassword: vi.fn().mockResolvedValue(true),
      });

      await expect(
        validatePassword("correctPassword", "hashedPassword")
      ).resolves.not.toThrow();
    });

    it("비밀번호가 틀릴 때 에러를 던져야 한다", async () => {
      // Mock 설정
      mockUseUserStore.getState.mockReturnValue({
        verifyPassword: vi.fn().mockResolvedValue(false),
      });

      await expect(
        validatePassword("wrongPassword", "hashedPassword")
      ).rejects.toThrow();

      try {
        await validatePassword("wrongPassword", "hashedPassword");
      } catch (error: any) {
        expect(error.detailCode).toBe(ApiErrorCode.INVALID_CREDENTIALS);
        expect(error.message).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    });
  });

  describe("generateAndStoreTokens", () => {
    it("토큰을 생성하고 저장해야 한다", () => {
      // Mock 설정
      mockTokenStorage.generateTokens.mockReturnValue(mockTokens);

      const result = generateAndStoreTokens("user-123");

      expect(mockTokenStorage.generateTokens).toHaveBeenCalledWith("user-123");
      expect(mockTokenStorage.setTokens).toHaveBeenCalledWith(
        mockTokens.accessToken,
        mockTokens.refreshToken
      );
      expect(result).toEqual(mockTokens);
    });
  });

  describe("authenticateUser", () => {
    it("사용자 인증 처리를 완료해야 한다", () => {
      // Mock 설정
      const mockSetCurrentUser = vi.fn();
      mockUseUserStore.getState.mockReturnValue({
        setCurrentUser: mockSetCurrentUser,
      });
      mockTokenStorage.generateTokens.mockReturnValue(mockTokens);

      const result = authenticateUser(mockUser);

      expect(mockTokenStorage.generateTokens).toHaveBeenCalledWith(mockUser.id);
      expect(mockTokenStorage.setTokens).toHaveBeenCalledWith(
        mockTokens.accessToken,
        mockTokens.refreshToken
      );
      expect(mockSetCurrentUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockTokens);
    });
  });

  describe("createAuthResponse", () => {
    it("올바른 AuthResponse 객체를 생성해야 한다", () => {
      const result = createAuthResponse(mockUser, mockTokens);

      expect(result).toEqual({
        user: mockUser,
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });
    });
  });

  describe("toPublicUser", () => {
    it("StoredUser에서 passwordHash를 제거하고 User 객체를 반환해야 한다", () => {
      const result = toPublicUser(mockStoredUser);

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("원본 객체를 변경하지 않아야 한다", () => {
      const originalStoredUser = { ...mockStoredUser };

      toPublicUser(mockStoredUser);

      expect(mockStoredUser).toEqual(originalStoredUser);
      expect(mockStoredUser).toHaveProperty("passwordHash");
    });
  });

  describe("validateAndParseRefreshToken", () => {
    it("유효한 리프레시 토큰을 파싱해야 한다", () => {
      const mockPayload = {
        userId: "user-123",
        type: "refresh",
        exp: Date.now() + 1000000,
      };

      mockTokenStorage.parseToken.mockReturnValue(mockPayload);

      const result = validateAndParseRefreshToken("valid-refresh-token");

      expect(mockTokenStorage.parseToken).toHaveBeenCalledWith(
        "valid-refresh-token"
      );
      expect(result).toEqual(mockPayload);
    });

    it("유효하지 않은 토큰일 때 에러를 던져야 한다", () => {
      mockTokenStorage.parseToken.mockReturnValue(null);

      expect(() => validateAndParseRefreshToken("invalid-token")).toThrow();

      try {
        validateAndParseRefreshToken("invalid-token");
      } catch (error: any) {
        expect(error.detailCode).toBe(ApiErrorCode.INVALID_REFRESH_TOKEN);
        expect(error.message).toBe(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
      }
    });

    it("타입이 refresh가 아닐 때 에러를 던져야 한다", () => {
      const mockPayload = {
        userId: "user-123",
        type: "access", // 잘못된 타입
        exp: Date.now() + 1000000,
      };

      mockTokenStorage.parseToken.mockReturnValue(mockPayload);

      expect(() => validateAndParseRefreshToken("access-token")).toThrow();

      try {
        validateAndParseRefreshToken("access-token");
      } catch (error: any) {
        expect(error.detailCode).toBe(ApiErrorCode.INVALID_REFRESH_TOKEN);
        expect(error.message).toBe(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
      }
    });
  });

  describe("findUserByIdForRefresh", () => {
    it("사용자가 존재할 때 해당 사용자를 반환해야 한다", () => {
      // Mock 설정
      mockUseUserStore.getState.mockReturnValue({
        findUserById: vi.fn().mockReturnValue(mockStoredUser),
      });

      const result = findUserByIdForRefresh("user-123");

      expect(result).toEqual(mockStoredUser);
      expect(mockUseUserStore.getState().findUserById).toHaveBeenCalledWith(
        "user-123"
      );
    });

    it("사용자가 존재하지 않을 때 리프레시 토큰 에러를 던져야 한다", () => {
      // Mock 설정
      mockUseUserStore.getState.mockReturnValue({
        findUserById: vi.fn().mockReturnValue(null),
      });

      expect(() => findUserByIdForRefresh("nonexistent")).toThrow();

      try {
        findUserByIdForRefresh("nonexistent");
      } catch (error: any) {
        expect(error.detailCode).toBe(ApiErrorCode.INVALID_REFRESH_TOKEN);
        expect(error.message).toBe(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
      }
    });
  });
});
