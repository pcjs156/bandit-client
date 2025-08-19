import type { User } from "@src/types/user";
import type {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  UpdateUserRequest,
  AuthResponse,
  AuthTokens,
} from "@src/types/api";

/**
 * API 클라이언트 인터페이스
 * 실제 HTTP API와 LocalStorage 구현체 모두 이 인터페이스를 구현
 */
export interface AuthApiClient {
  /**
   * 회원가입
   */
  register(data: RegisterRequest): Promise<AuthResponse>;

  /**
   * 로그인
   */
  login(data: LoginRequest): Promise<AuthResponse>;

  /**
   * 로그아웃
   */
  logout(): Promise<void>;

  /**
   * 토큰 갱신
   */
  refreshToken(data: RefreshTokenRequest): Promise<AuthTokens>;
}

export interface UserApiClient {
  /**
   * 내 정보 조회
   */
  getMe(): Promise<User>;

  /**
   * 내 정보 수정
   */
  updateMe(data: UpdateUserRequest): Promise<User>;
}

/**
 * 전체 API 클라이언트 인터페이스
 */
export interface ApiClient {
  auth: AuthApiClient;
  user: UserApiClient;
}
