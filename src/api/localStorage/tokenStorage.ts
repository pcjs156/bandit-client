/**
 * 토큰 관리 클래스
 */
export class TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = "bandit_access_token";
  private static readonly REFRESH_TOKEN_KEY = "bandit_refresh_token";

  /**
   * 토큰 저장
   */
  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * 토큰 조회
   */
  static getTokens(): {
    accessToken: string | null;
    refreshToken: string | null;
  } {
    return {
      accessToken: localStorage.getItem(this.ACCESS_TOKEN_KEY),
      refreshToken: localStorage.getItem(this.REFRESH_TOKEN_KEY),
    };
  }

  /**
   * 토큰 삭제
   */
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * 간단한 JWT 토큰 생성 (실제로는 서버에서 생성)
   */
  static generateTokens(userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const now = Date.now();
    const accessPayload = {
      userId,
      exp: now + 15 * 60 * 1000, // 15분
      type: "access",
    };
    const refreshPayload = {
      userId,
      exp: now + 7 * 24 * 60 * 60 * 1000, // 7일
      type: "refresh",
    };

    return {
      accessToken: btoa(JSON.stringify(accessPayload)),
      refreshToken: btoa(JSON.stringify(refreshPayload)),
    };
  }

  /**
   * 토큰 검증 및 파싱
   */
  static parseToken(
    token: string,
  ): { userId: string; exp: number; type: string } | null {
    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp < Date.now()) {
        return null; // 만료됨
      }
      return payload;
    } catch {
      return null; // 잘못된 토큰
    }
  }
}
