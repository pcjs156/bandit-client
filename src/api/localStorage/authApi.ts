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
import type { StoredUser } from "./userStorage";
import { ApiErrorCode } from "@src/types/api";
import { LocalStorageUtil } from "./storage";
import { AuthValidation } from "@src/utils/authValidation";

/**
 * LocalStorage 기반 인증 API 구현체
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
    const existingUser = LocalStorageUtil.findUserByUserId(data.userId);
    if (existingUser) {
      const error: ApiError = {
        detailCode: ApiErrorCode.USER_ID_ALREADY_EXISTS,
        message: "이미 사용중인 아이디입니다",
      };
      throw error;
    }

    // 사용자 생성
    const storedUser = await LocalStorageUtil.createUser(data);
    const user = this.toPublicUser(storedUser);

    // 토큰 생성
    const tokens = LocalStorageUtil.generateTokens(user.id);

    // 현재 사용자로 설정
    LocalStorageUtil.setCurrentUser(user);
    LocalStorageUtil.setTokens(tokens.accessToken, tokens.refreshToken);

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

    // 사용자 찾기
    const storedUser = LocalStorageUtil.findUserByUserId(data.userId);
    if (!storedUser) {
      const error: ApiError = {
        detailCode: ApiErrorCode.INVALID_CREDENTIALS,
        message: "아이디 또는 비밀번호가 잘못되었습니다",
      };
      throw error;
    }

    // 비밀번호 확인
    if (
      !(await LocalStorageUtil.verifyPassword(
        data.password,
        storedUser.passwordHash
      ))
    ) {
      const error: ApiError = {
        detailCode: ApiErrorCode.INVALID_CREDENTIALS,
        message: "아이디 또는 비밀번호가 잘못되었습니다",
      };
      throw error;
    }

    const user = this.toPublicUser(storedUser);

    // 토큰 생성
    const tokens = LocalStorageUtil.generateTokens(user.id);

    // 현재 사용자로 설정
    LocalStorageUtil.setCurrentUser(user);
    LocalStorageUtil.setTokens(tokens.accessToken, tokens.refreshToken);

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
    LocalStorageUtil.clearAuth();
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(data: RefreshTokenRequest): Promise<AuthTokens> {
    const payload = LocalStorageUtil.parseToken(data.refreshToken);

    if (!payload || payload.type !== "refresh") {
      const error: ApiError = {
        detailCode: ApiErrorCode.INVALID_REFRESH_TOKEN,
        message: "다시 로그인해주세요",
      };
      throw error;
    }

    // 사용자 확인
    const storedUser = LocalStorageUtil.findUserById(payload.userId);
    if (!storedUser) {
      const error: ApiError = {
        detailCode: ApiErrorCode.INVALID_REFRESH_TOKEN,
        message: "다시 로그인해주세요",
      };
      throw error;
    }

    // 새 토큰 생성
    const tokens = LocalStorageUtil.generateTokens(payload.userId);
    LocalStorageUtil.setTokens(tokens.accessToken, tokens.refreshToken);

    return tokens;
  }

  /**
   * 내부 저장용 사용자 객체를 공개 사용자 객체로 변환
   */
  private toPublicUser(storedUser: StoredUser): User {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...publicUser } = storedUser;
    return publicUser;
  }
}
