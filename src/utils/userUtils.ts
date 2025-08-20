import type { User, CreateUserData } from "@src/types/user";
import type { StoredUser } from "@src/stores/userStore";
import { PasswordUtils } from "@src/utils/passwordUtils";

/**
 * 사용자 관련 유틸리티 함수들
 */

/**
 * UUID 생성 함수
 * crypto.randomUUID가 있으면 사용하고, 없으면 fallback 구현 사용
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 새 사용자 객체 생성
 */
export async function createStoredUser(
  userData: CreateUserData,
): Promise<StoredUser> {
  const passwordHash = await PasswordUtils.hashPassword(userData.password);

  return {
    id: generateUUID(),
    userId: userData.userId,
    nickname: userData.nickname,
    passwordHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 사용자 정보 업데이트 (타임스탬프 자동 갱신)
 */
export function updateUserWithTimestamp(
  user: StoredUser,
  updates: Partial<User>,
): StoredUser {
  return {
    ...user,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 저장된 사용자를 공개 사용자로 변환 (비밀번호 해시 제거)
 */
export function toPublicUser(storedUser: StoredUser): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...publicUser } = storedUser;
  return publicUser;
}

/**
 * 사용자 배열에서 특정 사용자 찾기
 */
export function findUserByUserId(
  users: StoredUser[],
  userId: string,
): StoredUser | null {
  return users.find((user) => user.userId === userId) || null;
}

/**
 * 사용자 배열에서 ID로 사용자 찾기
 */
export function findUserById(
  users: StoredUser[],
  id: string,
): StoredUser | null {
  return users.find((user) => user.id === id) || null;
}

/**
 * 사용자 배열에서 특정 사용자 업데이트
 */
export function updateUserInArray(
  users: StoredUser[],
  id: string,
  updates: Partial<User>,
): { updatedUsers: StoredUser[]; updatedUser: StoredUser | null } {
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    return { updatedUsers: users, updatedUser: null };
  }

  const updatedUser = updateUserWithTimestamp(users[userIndex], updates);
  const updatedUsers = [...users];
  updatedUsers[userIndex] = updatedUser;

  return { updatedUsers, updatedUser };
}

/**
 * 비밀번호 검증
 */
export async function verifyUserPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return PasswordUtils.verifyPassword(password, hash);
}
