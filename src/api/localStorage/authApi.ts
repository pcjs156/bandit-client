import type { AuthApiClient } from "@src/api/types";
import type {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  AuthResponse,
  AuthTokens,
} from "@src/types/api";
import { AuthValidation } from "@src/utils/authValidation";
import { TokenStorage } from "./tokenStorage";
import { useUserStore } from "@src/stores/userStore";
import {
  validateUserIdNotExists,
  findAndValidateUser,
  validatePassword,
  authenticateUser,
  createAuthResponse,
  toPublicUser,
  validateAndParseRefreshToken,
  findUserByIdForRefresh,
  generateAndStoreTokens,
} from "@src/utils/apiHelpers";

/**
 * LocalStorage 기반 인증 API 구현체
 * 공통 로직은 apiHelpers로 분리하여 간소화
 */
export class LocalStorageAuthApi implements AuthApiClient {
  /**
   * 회원가입
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // 입력값 검증
    const validationError = AuthValidation.validateRegisterInput(data);
    if (validationError) {
      throw validationError;
    }

    // 중복 사용자 확인
    validateUserIdNotExists(data.userId);

    // 사용자 생성
    const userStore = useUserStore.getState();
    const storedUser = await userStore.createUser(data);
    const user = toPublicUser(storedUser);

    // 인증 처리 (토큰 생성 + 현재 사용자 설정)
    const tokens = authenticateUser(user);

    return createAuthResponse(user, tokens);
  }

  /**
   * 로그인
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    // 사용자 찾기 및 검증
    const storedUser = findAndValidateUser(data.userId);

    // 비밀번호 확인
    await validatePassword(data.password, storedUser.passwordHash);

    const user = toPublicUser(storedUser);

    // 인증 처리 (토큰 생성 + 현재 사용자 설정)
    const tokens = authenticateUser(user);

    return createAuthResponse(user, tokens);
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    const userStore = useUserStore.getState();
    userStore.setCurrentUser(null);
    TokenStorage.clearTokens();
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(data: RefreshTokenRequest): Promise<AuthTokens> {
    // 리프레시 토큰 검증 및 파싱
    const payload = validateAndParseRefreshToken(data.refreshToken);

    // 사용자 확인
    findUserByIdForRefresh(payload.userId);

    // 새 토큰 생성 및 저장
    return generateAndStoreTokens(payload.userId);
  }
}
