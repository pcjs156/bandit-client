import type {
  RegisterRequest,
  UpdateUserRequest,
  ApiError,
} from "@src/types/api";
import { ApiErrorCode } from "@src/types/api";
import { USER_VALIDATION } from "@src/types/user";

/**
 * 인증 관련 입력값 검증 유틸리티
 */
export class AuthValidation {
  /**
   * 회원가입 입력값 검증
   */
  static validateRegisterInput(data: RegisterRequest): ApiError | null {
    const { userId, password, nickname } = data;

    // userId 검증
    if (
      !userId ||
      userId.length < USER_VALIDATION.USER_ID.MIN_LENGTH ||
      userId.length > USER_VALIDATION.USER_ID.MAX_LENGTH
    ) {
      return {
        detailCode: ApiErrorCode.VALIDATION_ERROR,
        message: `아이디는 ${USER_VALIDATION.USER_ID.MIN_LENGTH}-${USER_VALIDATION.USER_ID.MAX_LENGTH}자 사이여야 합니다`,
      };
    }

    if (!USER_VALIDATION.USER_ID.PATTERN.test(userId)) {
      return {
        detailCode: ApiErrorCode.VALIDATION_ERROR,
        message: "아이디는 영문과 숫자만 사용할 수 있습니다",
      };
    }

    // password 검증
    if (
      !password ||
      password.length < USER_VALIDATION.PASSWORD.MIN_LENGTH ||
      password.length > USER_VALIDATION.PASSWORD.MAX_LENGTH
    ) {
      return {
        detailCode: ApiErrorCode.VALIDATION_ERROR,
        message: `비밀번호는 ${USER_VALIDATION.PASSWORD.MIN_LENGTH}-${USER_VALIDATION.PASSWORD.MAX_LENGTH}자 사이여야 합니다`,
      };
    }

    if (!USER_VALIDATION.PASSWORD.PATTERN.test(password)) {
      return {
        detailCode: ApiErrorCode.VALIDATION_ERROR,
        message: "비밀번호는 영문과 숫자를 모두 포함해야 합니다",
      };
    }

    // nickname 검증
    if (
      !nickname ||
      nickname.length < USER_VALIDATION.NICKNAME.MIN_LENGTH ||
      nickname.length > USER_VALIDATION.NICKNAME.MAX_LENGTH
    ) {
      return {
        detailCode: ApiErrorCode.VALIDATION_ERROR,
        message: `닉네임은 ${USER_VALIDATION.NICKNAME.MIN_LENGTH}-${USER_VALIDATION.NICKNAME.MAX_LENGTH}자 사이여야 합니다`,
      };
    }

    return null;
  }

  /**
   * 사용자 정보 수정 입력값 검증
   */
  static validateUpdateUserInput(data: UpdateUserRequest): ApiError | null {
    const { nickname } = data;

    // nickname이 제공된 경우에만 검증
    if (nickname !== undefined) {
      if (
        !nickname ||
        nickname.length < USER_VALIDATION.NICKNAME.MIN_LENGTH ||
        nickname.length > USER_VALIDATION.NICKNAME.MAX_LENGTH
      ) {
        return {
          detailCode: ApiErrorCode.VALIDATION_ERROR,
          message: `닉네임은 ${USER_VALIDATION.NICKNAME.MIN_LENGTH}-${USER_VALIDATION.NICKNAME.MAX_LENGTH}자 사이여야 합니다`,
        };
      }
    }

    return null;
  }

  /**
   * 로그인 입력값 검증
   */
  static validateLoginInput(userId: string, password: string): ApiError | null {
    if (!userId || !password) {
      return {
        detailCode: ApiErrorCode.VALIDATION_ERROR,
        message: "아이디와 비밀번호를 모두 입력해주세요",
      };
    }

    return null;
  }
}
