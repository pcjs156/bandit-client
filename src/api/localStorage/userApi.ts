import type { UserApiClient } from "@src/api/types";
import type { UpdateUserRequest, ApiError } from "@src/types/api";
import type { User } from "@src/types/user";
import { ApiErrorCode } from "@src/types/api";
import { LocalStorageUtil } from "./storage";
import { AuthValidation } from "@src/utils/authValidation";

/**
 * LocalStorage 기반 사용자 API 구현체
 */
export class LocalStorageUserApi implements UserApiClient {
  /**
   * 현재 로그인된 사용자 정보 조회
   */
  async getMe(): Promise<User> {
    const currentUser = LocalStorageUtil.getCurrentUser();

    if (!currentUser) {
      const error: ApiError = {
        detailCode: ApiErrorCode.UNAUTHORIZED,
      };
      throw error;
    }

    // 최신 정보 조회 (다른 탭에서 수정되었을 수도 있음)
    const storedUser = LocalStorageUtil.findUserById(currentUser.id);
    if (!storedUser) {
      const error: ApiError = {
        detailCode: ApiErrorCode.UNAUTHORIZED,
      };
      throw error;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...publicUser } = storedUser;
    return publicUser;
  }

  /**
   * 현재 로그인된 사용자 정보 수정
   */
  async updateMe(data: UpdateUserRequest): Promise<User> {
    const currentUser = LocalStorageUtil.getCurrentUser();

    if (!currentUser) {
      const error: ApiError = {
        detailCode: ApiErrorCode.UNAUTHORIZED,
      };
      throw error;
    }

    // 입력값 검증
    const validationError = AuthValidation.validateUpdateUserInput(data);
    if (validationError) {
      throw validationError;
    }

    // 사용자 정보 업데이트
    const updatedUser = LocalStorageUtil.updateUser(currentUser.id, data);

    if (!updatedUser) {
      const error: ApiError = {
        detailCode: ApiErrorCode.NOT_FOUND,
        message: "사용자를 찾을 수 없습니다",
      };
      throw error;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...publicUser } = updatedUser;

    // 현재 사용자 정보도 업데이트
    LocalStorageUtil.setCurrentUser(publicUser);

    return publicUser;
  }
}
