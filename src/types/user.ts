/**
 * 사용자 정보 타입
 */
export interface User {
  id: string; // UUID
  userId: string; // 로그인 ID
  nickname: string; // 표시명
  createdAt: string; // ISO 8601 형식
  updatedAt: string; // ISO 8601 형식
}

/**
 * 사용자 생성 시 필요한 정보
 */
export interface CreateUserData {
  userId: string;
  password: string;
  nickname: string;
}

/**
 * 사용자 검증 규칙
 */
export const USER_VALIDATION = {
  USER_ID: {
    MIN_LENGTH: 4,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9]+$/, // 영문+숫자만
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    PATTERN: /^(?=.*[a-zA-Z])(?=.*\d)/, // 최소 1개 이상의 영문+숫자
  },
  NICKNAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
  },
} as const;
