import type { AuthApiClient } from "@src/api/types";
import type {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  AuthResponse,
  AuthTokens,
  ApiError,
} from "@src/types/api";
import type { User } from "@src/types/user";
import { ApiErrorCode } from "@src/types/api";
import { AuthValidation } from "@src/utils/authValidation";
import { TokenStorage } from "./tokenStorage";
import { useUserStore } from "@src/stores/userStore";

/**
 * Zustand 기반 인증 API 구현체
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

    const userStore = useUserStore.getState();

    // 중복 사용자 확인
    const existingUser = userStore.findUserByUserId(data.userId);
    if (existingUser) {
      const error: ApiError = {
        detailCode: ApiErrorCode.USER_ID_ALREADY_EXISTS,
        message: "이미 사용중인 아이디입니다",
      };
      throw error;
    }

    // 사용자 생성
    const storedUser = await userStore.createUser(data);
    const user = this.toPublicUser(storedUser);

    // 토큰 생성
    const tokens = TokenStorage.generateTokens(user.id);

    // 현재 사용자로 설정
    userStore.setCurrentUser(user);
    TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * 로그인
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    // 입력값 검증
    const validationError = AuthValidation.validateLoginInput(
      data.userId,
      data.password
    );
    if (validationError) {
      throw validationError;
    }

    const userStore = useUserStore.getState();

    // 사용자 찾기
    const storedUser = userStore.findUserByUserId(data.userId);
    if (!storedUser) {
      const error: ApiError = {
        detailCode: ApiErrorCode.INVALID_CREDENTIALS,
        message: "아이디 또는 비밀번호가 잘못되었습니다",
      };
      throw error;
    }

    // 비밀번호 확인
    const isPasswordValid = await userStore.verifyPassword(
      data.password,
      storedUser.passwordHash
    );

    if (!isPasswordValid) {
      const error: ApiError = {
        detailCode: ApiErrorCode.INVALID_CREDENTIALS,
        message: "아이디 또는 비밀번호가 잘못되었습니다",
      };
      throw error;
    }

    const user = this.toPublicUser(storedUser);

    // 토큰 생성
    const tokens = TokenStorage.generateTokens(user.id);

    // 현재 사용자로 설정
    userStore.setCurrentUser(user);
    TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
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
    const payload = TokenStorage.parseToken(data.refreshToken);

    if (!payload || payload.type !== "refresh") {
      const error: ApiError = {
        detailCode: ApiErrorCode.INVALID_REFRESH_TOKEN,
        message: "다시 로그인해주세요",
      };
      throw error;
    }

    const userStore = useUserStore.getState();

    // 사용자 확인
    const storedUser = userStore.findUserById(payload.userId);
    if (!storedUser) {
      const error: ApiError = {
        detailCode: ApiErrorCode.INVALID_REFRESH_TOKEN,
        message: "다시 로그인해주세요",
      };
      throw error;
    }

    // 새 토큰 생성
    const tokens = TokenStorage.generateTokens(payload.userId);
    TokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);

    return tokens;
  }

  /**
   * 내부 저장용 사용자 객체를 공개 사용자 객체로 변환
   */
  private toPublicUser(storedUser: { passwordHash: string } & User): User {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...publicUser } = storedUser;
    return publicUser;
  }
}
