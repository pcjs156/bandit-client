import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@src/types/user";
import type { RegisterRequest, LoginRequest, ApiError } from "@src/types/api";
import { apiClient } from "@src/api";

/**
 * 인증 상태 타입
 */
type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

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
    (set, get) => ({
      // 초기 상태
      status: "idle",
      user: null,
      error: null,

      // 회원가입
      register: async (data: RegisterRequest) => {
        set({ status: "loading", error: null });

        try {
          const response = await apiClient.auth.register(data);
          set({
            status: "authenticated",
            user: response.user,
            error: null,
          });
        } catch (error) {
          const apiError = error as ApiError;
          set({
            status: "unauthenticated",
            user: null,
            error: apiError.message || "회원가입에 실패했습니다",
          });
          throw error;
        }
      },

      // 로그인
      login: async (data: LoginRequest) => {
        set({ status: "loading", error: null });

        try {
          const response = await apiClient.auth.login(data);
          set({
            status: "authenticated",
            user: response.user,
            error: null,
          });
        } catch (error) {
          const apiError = error as ApiError;
          set({
            status: "unauthenticated",
            user: null,
            error: apiError.message || "로그인에 실패했습니다",
          });
          throw error;
        }
      },

      // 로그아웃
      logout: async () => {
        try {
          await apiClient.auth.logout();
        } catch (error) {
          // 로그아웃 에러는 무시 (이미 로그아웃된 상태일 수 있음)
          console.warn("Logout error:", error);
        } finally {
          set({
            status: "unauthenticated",
            user: null,
            error: null,
          });
        }
      },

      // 토큰 갱신
      refreshToken: async () => {
        const tokens = JSON.parse(
          localStorage.getItem("bandit_refresh_token") || "null"
        );
        if (!tokens) {
          set({ status: "unauthenticated", user: null });
          return;
        }

        try {
          await apiClient.auth.refreshToken({ refreshToken: tokens });
          // 토큰 갱신 성공 시 사용자 정보 다시 조회
          const user = await apiClient.user.getMe();
          set({ status: "authenticated", user, error: null });
        } catch (error) {
          set({ status: "unauthenticated", user: null, error: null });
          throw error;
        }
      },

      // 프로필 업데이트
      updateProfile: async (nickname: string) => {
        const currentUser = get().user;
        if (!currentUser) {
          throw new Error("로그인이 필요합니다");
        }

        try {
          const updatedUser = await apiClient.user.updateMe({ nickname });
          set({ user: updatedUser, error: null });
        } catch (error) {
          const apiError = error as ApiError;
          set({ error: apiError.message || "프로필 업데이트에 실패했습니다" });
          throw error;
        }
      },

      // 에러 초기화
      clearError: () => {
        set({ error: null });
      },

      // 앱 시작 시 초기화
      initialize: async () => {
        set({ status: "loading" });

        try {
          // 저장된 사용자 정보가 있는지 확인
          const user = await apiClient.user.getMe();
          set({ status: "authenticated", user, error: null });
        } catch {
          // 인증 정보가 없거나 만료된 경우
          set({ status: "unauthenticated", user: null, error: null });
        }
      },
    }),
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
