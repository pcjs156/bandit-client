import type { User, CreateUserData } from "@src/types/user";

/**
 * 저장된 사용자 데이터 (비밀번호 해시 포함)
 */
export interface StoredUser extends User {
  passwordHash: string;
}

/**
 * 사용자 데이터 관리 클래스
 */
export class UserStorage {
  private static readonly USERS_KEY = "bandit_users";
  private static readonly CURRENT_USER_KEY = "bandit_current_user";

  /**
   * 모든 사용자 목록 조회
   */
  static getUsers(): StoredUser[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  /**
   * 사용자 목록 저장
   */
  static saveUsers(users: StoredUser[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  /**
   * userId로 사용자 찾기
   */
  static findUserByUserId(userId: string): StoredUser | null {
    const users = this.getUsers();
    return users.find((user) => user.userId === userId) || null;
  }

  /**
   * ID로 사용자 찾기
   */
  static findUserById(id: string): StoredUser | null {
    const users = this.getUsers();
    return users.find((user) => user.id === id) || null;
  }

  /**
   * 새 사용자 생성
   */
  static createUser(
    userData: CreateUserData,
    passwordHash: string
  ): StoredUser {
    const users = this.getUsers();
    const newUser: StoredUser = {
      id: this.generateUUID(),
      userId: userData.userId,
      nickname: userData.nickname,
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    return newUser;
  }

  /**
   * 사용자 정보 업데이트
   */
  static updateUser(
    id: string,
    updates: Partial<Pick<User, "nickname">>
  ): StoredUser | null {
    const users = this.getUsers();
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex === -1) return null;

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveUsers(users);
    return users[userIndex];
  }

  /**
   * 현재 로그인된 사용자 정보 저장
   */
  static setCurrentUser(user: User): void {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  /**
   * 현재 로그인된 사용자 정보 조회
   */
  static getCurrentUser(): User | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /**
   * 현재 사용자 정보 삭제
   */
  static clearCurrentUser(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  /**
   * 안전한 UUID 생성 (crypto.randomUUID() 사용)
   */
  private static generateUUID(): string {
    // 브라우저 환경에서 암호학적으로 안전한 UUID 생성
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // 폴백: crypto.getRandomValues() 사용
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const array = new Uint8Array(1);
          crypto.getRandomValues(array);
          const r = array[0] % 16;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    }

    // 최후 폴백 (개발 환경에서만)
    console.warn("crypto API not available, using fallback UUID generation");
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
