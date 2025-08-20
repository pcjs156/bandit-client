import type { ApiError, AuthResponse, AuthTokens } from "@src/types/api";
import { ApiErrorCode } from "@src/types/api";
import type { User } from "@src/types/user";
import type { StoredUser } from "@src/stores/userStore";
import { TokenStorage } from "@src/api/localStorage/tokenStorage";
import { useUserStore } from "@src/stores/userStore";

/**
 * API 관련 헬퍼 함수들
 */

/**
 * API 에러 생성 헬퍼
 */
export function createApiError(code: string, message: string): ApiError {
  return {
    detailCode: code,
    message,
  };
}

/**
 * 공통 에러 메시지들
 */
export const ERROR_MESSAGES = {
  USER_ALREADY_EXISTS: "이미 사용중인 아이디입니다",
  INVALID_CREDENTIALS: "아이디 또는 비밀번호가 잘못되었습니다",
  INVALID_REFRESH_TOKEN: "다시 로그인해주세요",
} as const;

/**
 * 사용자 ID로 사용자 찾기 및 검증
 */
export function findAndValidateUser(userId: string): StoredUser {
  const userStore = useUserStore.getState();
  const storedUser = userStore.findUserByUserId(userId);

  if (!storedUser) {
    throw createApiError(
      ApiErrorCode.INVALID_CREDENTIALS,
      ERROR_MESSAGES.INVALID_CREDENTIALS,
    );
  }

  return storedUser;
}

/**
 * 사용자 ID 중복 확인
 */
export function validateUserIdNotExists(userId: string): void {
  const userStore = useUserStore.getState();
  const existingUser = userStore.findUserByUserId(userId);

  if (existingUser) {
    throw createApiError(
      ApiErrorCode.USER_ID_ALREADY_EXISTS,
      ERROR_MESSAGES.USER_ALREADY_EXISTS,
    );
  }
}

/**
 * 비밀번호 검증
 */
export async function validatePassword(
  password: string,
  hash: string,
): Promise<void> {
  const userStore = useUserStore.getState();
  const isPasswordValid = await userStore.verifyPassword(password, hash);

  if (!isPasswordValid) {
    throw createApiError(
      ApiErrorCode.INVALID_CREDENTIALS,
      ERROR_MESSAGES.INVALID_CREDENTIALS,
    );
  }
}

/**
 * 토큰 생성 및 저장
 */
export function generateAndStoreTokens(userId: string): AuthTokens {
  const tokens = TokenStorage.generateTokens(userId);
  TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
  return tokens;
}

/**
 * 사용자 로그인 처리 (토큰 생성 + 현재 사용자 설정)
 */
export function authenticateUser(user: User): AuthTokens {
  const userStore = useUserStore.getState();
  const tokens = generateAndStoreTokens(user.id);
  userStore.setCurrentUser(user);
  return tokens;
}

/**
 * AuthResponse 생성
 */
export function createAuthResponse(
  user: User,
  tokens: AuthTokens,
): AuthResponse {
  return {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

/**
 * 저장된 사용자를 공개 사용자로 변환
 */
export function toPublicUser(storedUser: StoredUser): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...publicUser } = storedUser;
  return publicUser;
}

/**
 * 리프레시 토큰 검증 및 파싱
 */
export function validateAndParseRefreshToken(refreshToken: string) {
  const payload = TokenStorage.parseToken(refreshToken);

  if (!payload || payload.type !== "refresh") {
    throw createApiError(
      ApiErrorCode.INVALID_REFRESH_TOKEN,
      ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
    );
  }

  return payload;
}

/**
 * 사용자 ID로 사용자 찾기 (리프레시 토큰용)
 */
export function findUserByIdForRefresh(userId: string): StoredUser {
  const userStore = useUserStore.getState();
  const storedUser = userStore.findUserById(userId);

  if (!storedUser) {
    throw createApiError(
      ApiErrorCode.INVALID_REFRESH_TOKEN,
      ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
    );
  }

  return storedUser;
}
