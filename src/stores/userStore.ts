import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@src/types/user";
import type { CreateUserData } from "@src/types/user";
import {
  createStoredUser,
  findUserByUserId,
  findUserById,
  updateUserInArray,
  toPublicUser,
  verifyUserPassword,
} from "@src/utils/userUtils";

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
 * 사용자 데이터 관리 스토어
 * 유틸리티 함수로 로직 분리하여 간소화
 */
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      users: [],
      currentUser: null,

      // 새 사용자 생성
      createUser: async (userData: CreateUserData) => {
        const newUser = await createStoredUser(userData);

        set((state) => ({
          users: [...state.users, newUser],
        }));

        return newUser;
      },

      // userId로 사용자 찾기
      findUserByUserId: (userId: string) => {
        const { users } = get();
        return findUserByUserId(users, userId);
      },

      // ID로 사용자 찾기
      findUserById: (id: string) => {
        const { users } = get();
        return findUserById(users, id);
      },

      // 현재 사용자 설정
      setCurrentUser: (user: User | null) => {
        set({ currentUser: user });
      },

      // 사용자 정보 업데이트
      updateUser: (id: string, updates: Partial<User>) => {
        const { users, currentUser } = get();
        const { updatedUsers, updatedUser } = updateUserInArray(
          users,
          id,
          updates,
        );

        if (!updatedUser) return null;

        set({ users: updatedUsers });

        // 현재 사용자가 업데이트된 사용자인 경우 currentUser도 업데이트
        if (currentUser && currentUser.id === id) {
          set({ currentUser: toPublicUser(updatedUser) });
        }

        return updatedUser;
      },

      // 비밀번호 검증
      verifyPassword: async (password: string, hash: string) => {
        return verifyUserPassword(password, hash);
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
    },
  ),
);
