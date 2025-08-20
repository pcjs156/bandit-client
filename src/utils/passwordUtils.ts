import bcrypt from "bcryptjs";

/**
 * 비밀번호 관련 유틸리티 함수들
 */
export class PasswordUtils {
  /**
   * 비밀번호 검증
   */
  static async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error("Password verification failed:", error);
      return false;
    }
  }

  /**
   * 안전한 비밀번호 해싱 (bcrypt 사용)
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      // saltRounds 12는 보안과 성능의 균형점
      return await bcrypt.hash(password, 12);
    } catch (error) {
      console.error("Password hashing failed:", error);
      throw new Error("비밀번호 처리 중 오류가 발생했습니다");
    }
  }
}
