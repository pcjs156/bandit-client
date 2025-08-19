import type { CreateUserData } from "@src/types/user";
import { UserStorage, type StoredUser } from "./userStorage";
import { TokenStorage } from "./tokenStorage";
import { PasswordUtils } from "@src/utils/passwordUtils";

/**
 * LocalStorage 유틸리티 클래스 (레거시 호환성을 위한 래퍼)
 * @deprecated 새로운 코드에서는 UserStorage, TokenStorage, PasswordUtils를 직접 사용하세요
 */
export class LocalStorageUtil {
  // === 사용자 관리 메서드들 (UserStorage로 위임) ===
  static getUsers = UserStorage.getUsers;
  static findUserByUserId = UserStorage.findUserByUserId;
  static findUserById = UserStorage.findUserById;
  static updateUser = UserStorage.updateUser;
  static setCurrentUser = UserStorage.setCurrentUser;
  static getCurrentUser = UserStorage.getCurrentUser;

  /**
   * 새 사용자 생성
   */
  static async createUser(userData: CreateUserData): Promise<StoredUser> {
    const passwordHash = await PasswordUtils.hashPassword(userData.password);
    return UserStorage.createUser(userData, passwordHash);
  }

  // === 토큰 관리 메서드들 (TokenStorage로 위임) ===
  static setTokens = TokenStorage.setTokens;
  static getTokens = TokenStorage.getTokens;
  static generateTokens = TokenStorage.generateTokens;
  static parseToken = TokenStorage.parseToken;

  // === 비밀번호 관리 메서드들 (PasswordUtils로 위임) ===
  static verifyPassword = PasswordUtils.verifyPassword;

  /**
   * 로그아웃 (모든 인증 정보 삭제)
   */
  static clearAuth(): void {
    UserStorage.clearCurrentUser();
    TokenStorage.clearTokens();
  }
}

// 타입 재export (기존 코드 호환성을 위해)
export type { StoredUser } from "./userStorage";
