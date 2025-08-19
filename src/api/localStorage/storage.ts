import { TokenStorage } from "./tokenStorage";
import { useUserStore } from "@src/stores/userStore";

/**
 * LocalStorage 유틸리티 클래스 (레거시 호환성을 위한 래퍼)
 * @deprecated 새로운 코드에서는 useUserStore, TokenStorage를 직접 사용하세요
 */
export class LocalStorageUtil {
  // === 토큰 관리 메서드들 (TokenStorage로 위임) ===
  static setTokens = TokenStorage.setTokens;
  static getTokens = TokenStorage.getTokens;
  static generateTokens = TokenStorage.generateTokens;
  static parseToken = TokenStorage.parseToken;

  /**
   * 로그아웃 (모든 인증 정보 삭제)
   */
  static clearAuth(): void {
    const userStore = useUserStore.getState();
    userStore.setCurrentUser(null);
    TokenStorage.clearTokens();
  }
}
