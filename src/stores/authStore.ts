import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@src/types/user";
import type { RegisterRequest, LoginRequest } from "@src/types/api";
import { apiClient } from "@src/api";
import { TokenStorage } from "@src/api/localStorage/tokenStorage";
import {
  executeAuthAction,
  executeLogout,
  executeProfileUpdate,
  executeTokenRefresh,
  executeInitialize,
  type AuthStatus,
  type AuthStateUpdater,
} from "@src/utils/authHelpers";

/**
 * 인증 스토어 인터페이스
 */
interface AuthStore {
  // 상태
  status: AuthStatus;
  user: User | null;
  error: string | null;

  // 액션
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (nickname: string) => Promise<void>;
  clearError: () => void;
  clearAllStorage: () => void;

  // 초기화
  initialize: () => Promise<void>;
}

/**
 * 인증 상태 관리 스토어
 *
 * 기능:
 * - 회원가입, 로그인, 로그아웃
 * - 사용자 정보 관리
 * - 토큰 자동 갱신
 * - 에러 상태 관리
 * - LocalStorage에 상태 영속화
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      // 상태 업데이트 헬퍼 함수
      const updateState: AuthStateUpdater = (update) => set(update);

      return {
        // 초기 상태
        status: "idle",
        user: null,
        error: null,

        // 회원가입
        register: async (data: RegisterRequest) => {
          await executeAuthAction(
            "회원가입",
            data.userId,
            updateState,
            async () => {
              const response = await apiClient.auth.register(data);
              return {
                user: response.user,
                successMessage: "회원가입 성공",
              };
            }
          );
        },

        // 로그인
        login: async (data: LoginRequest) => {
          await executeAuthAction(
            "로그인",
            data.userId,
            updateState,
            async () => {
              const response = await apiClient.auth.login(data);
              return {
                user: response.user,
                successMessage: "로그인 성공",
              };
            }
          );
        },

        // 로그아웃
        logout: async () => {
          const currentUser = get().user;
          await executeLogout(currentUser, updateState, () =>
            apiClient.auth.logout()
          );
        },

        // 토큰 갱신
        refreshToken: async () => {
          const { refreshToken } = TokenStorage.getTokens();
          if (!refreshToken) {
            updateState({ status: "unauthenticated", user: null });
            return;
          }

          await executeTokenRefresh(updateState, async () => {
            await apiClient.auth.refreshToken({ refreshToken });
            return apiClient.user.getMe();
          });
        },

        // 프로필 업데이트
        updateProfile: async (nickname: string) => {
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error("로그인이 필요합니다");
          }

          await executeProfileUpdate(currentUser, nickname, updateState, () =>
            apiClient.user.updateMe({ nickname })
          );
        },

        // 에러 초기화
        clearError: () => {
          set({ error: null });
        },

        // localStorage 완전 정리 (디버깅용)
        clearAllStorage: () => {
          localStorage.clear();
          set({
            status: "unauthenticated",
            user: null,
            error: null,
          });
        },

        // 앱 시작 시 초기화
        initialize: async () => {
          await executeInitialize(updateState, () => apiClient.user.getMe());
        },
      };
    },
    {
      name: "bandit-auth",
      // 민감한 정보는 저장하지 않음 (토큰은 별도 관리)
      partialize: (state) => ({
        user: state.user,
        status:
          state.status === "authenticated"
            ? "authenticated"
            : "unauthenticated",
      }),
    }
  )
);
