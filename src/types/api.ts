/**
 * API 에러 응답 타입
 */
export interface ApiError {
  detailCode: string;
  message?: string;
}

/**
 * API 에러 코드 정의
 */
export const ApiErrorCode = {
  // 일반 에러
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NOT_FOUND: "NOT_FOUND",

  // 인증 에러
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_REFRESH_TOKEN: "INVALID_REFRESH_TOKEN",

  // 회원가입 에러
  USER_ID_ALREADY_EXISTS: "USER_ID_ALREADY_EXISTS",

  // 권한 에러
  FORBIDDEN: "FORBIDDEN",
} as const;

/**
 * API 요청/응답 타입들
 */

// 회원가입 요청
export interface RegisterRequest {
  userId: string;
  password: string;
  nickname: string;
}

// 로그인 요청
export interface LoginRequest {
  userId: string;
  password: string;
}

// 토큰 갱신 요청
export interface RefreshTokenRequest {
  refreshToken: string;
}

// 사용자 정보 수정 요청
export interface UpdateUserRequest {
  nickname?: string;
}

// 인증 토큰 응답
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// 로그인/회원가입 응답
export interface AuthResponse {
  user: import("./user").User;
  accessToken: string;
  refreshToken: string;
}
