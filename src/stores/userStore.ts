import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@src/types/user";
import type { CreateUserData } from "@src/types/user";
import { PasswordUtils } from "@src/utils/passwordUtils";

/**
 * 저장용 사용자 타입 (비밀번호 해시 포함)
 */
export interface StoredUser extends User {
  passwordHash: string;
}

/**
 * 사용자 스토어 인터페이스
 */
interface UserStore {
  // 상태
  users: StoredUser[];
  currentUser: User | null;

  // 액션
  createUser: (userData: CreateUserData) => Promise<StoredUser>;
  findUserByUserId: (userId: string) => StoredUser | null;
  findUserById: (id: string) => StoredUser | null;
  setCurrentUser: (user: User | null) => void;
  updateUser: (id: string, updates: Partial<User>) => StoredUser | null;
  verifyPassword: (password: string, hash: string) => Promise<boolean>;
  clearAllUsers: () => void;
}

/**
 * UUID 생성 함수
 */
function generateUUID(): string {
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
 * 사용자 데이터 관리 스토어
 */
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      users: [],
      currentUser: null,

      // 새 사용자 생성
      createUser: async (userData: CreateUserData) => {
        const passwordHash = await PasswordUtils.hashPassword(
          userData.password
        );

        const newUser: StoredUser = {
          id: generateUUID(),
          userId: userData.userId,
          nickname: userData.nickname,
          passwordHash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          users: [...state.users, newUser],
        }));

        return newUser;
      },

      // userId로 사용자 찾기
      findUserByUserId: (userId: string) => {
        const { users } = get();
        return users.find((user) => user.userId === userId) || null;
      },

      // ID로 사용자 찾기
      findUserById: (id: string) => {
        const { users } = get();
        return users.find((user) => user.id === id) || null;
      },

      // 현재 사용자 설정
      setCurrentUser: (user: User | null) => {
        set({ currentUser: user });
      },

      // 사용자 정보 업데이트
      updateUser: (id: string, updates: Partial<User>) => {
        const { users } = get();
        const userIndex = users.findIndex((user) => user.id === id);

        if (userIndex === -1) return null;

        const updatedUser = {
          ...users[userIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        const newUsers = [...users];
        newUsers[userIndex] = updatedUser;

        set({ users: newUsers });

        // 현재 사용자가 업데이트된 사용자인 경우 currentUser도 업데이트
        const { currentUser } = get();
        if (currentUser && currentUser.id === id) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { passwordHash, ...publicUser } = updatedUser;
          set({ currentUser: publicUser });
        }

        return updatedUser;
      },

      // 비밀번호 검증
      verifyPassword: async (password: string, hash: string) => {
        return PasswordUtils.verifyPassword(password, hash);
      },

      // 모든 사용자 데이터 삭제 (디버깅용)
      clearAllUsers: () => {
        set({
          users: [],
          currentUser: null,
        });
      },
    }),
    {
      name: "bandit-users",
      // 민감한 정보는 저장하되, 분리된 키로 관리
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
      }),
    }
  )
);
