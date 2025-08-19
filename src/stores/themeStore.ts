import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateColors } from "@mantine/colors-generator";
import type { PrimaryColor } from "@src/constants/colors";

/**
 * 애플리케이션의 컬러 스키마 타입
 * - light: 라이트 모드
 * - dark: 다크 모드
 */
type ColorScheme = "light" | "dark";

/**
 * 사용자 정의 색상 정보
 */
export interface CustomColor {
  /** 고유 식별자 (custom-{timestamp} 형태) */
  id: string;
  /** 사용자가 입력한 색상 이름 */
  name: string;
  /** 원본 색상 값 (hex 형태) */
  value: string;
  /** Mantine 색상 팔레트 (10단계 shade) */
  shades: readonly string[];
}

/**
 * 테마 관련 상태와 액션을 관리하는 Zustand 스토어 인터페이스
 */
interface ThemeStore {
  /** 현재 컬러 스키마 */
  colorScheme: ColorScheme;
  /** 현재 선택된 Primary Color */
  primaryColor: PrimaryColor;
  /** 사용자가 추가한 커스텀 색상 목록 */
  customColors: CustomColor[];
  /** 라이트/다크 모드 토글 */
  toggleColorScheme: () => void;
  /** Primary Color 변경 */
  setPrimaryColor: (color: PrimaryColor) => void;
  /** 새로운 커스텀 색상 추가 */
  addCustomColor: (name: string, color: string) => void;
  /** 커스텀 색상 삭제 */
  removeCustomColor: (id: string) => void;
}

/**
 * 테마 설정을 관리하는 Zustand 스토어
 *
 * localStorage에 자동으로 상태를 저장하며, 다음 기능을 제공합니다:
 * - 다크/라이트 모드 전환
 * - Primary Color 변경 (기본 색상 + 사용자 정의 색상)
 * - 커스텀 색상 추가/삭제 (자동으로 Mantine 색상 팔레트 생성)
 *
 * @example
 * ```tsx
 * const { colorScheme, toggleColorScheme } = useThemeStore();
 *
 * return (
 *   <Button onClick={toggleColorScheme}>
 *     {colorScheme === 'dark' ? '라이트 모드' : '다크 모드'}
 *   </Button>
 * );
 * ```
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      // 기본값 설정
      colorScheme: "dark",
      primaryColor: "red",
      customColors: [],

      // 다크/라이트 모드 토글
      toggleColorScheme: () =>
        set((state) => ({
          colorScheme: state.colorScheme === "light" ? "dark" : "light",
        })),

      // Primary Color 변경
      setPrimaryColor: (color: PrimaryColor) => set({ primaryColor: color }),

      // 커스텀 색상 추가 (자동으로 10단계 색상 팔레트 생성)
      addCustomColor: (name: string, color: string) =>
        set((state) => {
          const id = `custom-${Date.now()}`;
          const shades = generateColors(color);
          const newColor: CustomColor = {
            id,
            name,
            value: color,
            shades,
          };
          return {
            customColors: [...state.customColors, newColor],
          };
        }),

      // 커스텀 색상 삭제 (현재 선택된 색상이라면 기본값으로 변경)
      removeCustomColor: (id: string) =>
        set((state) => ({
          customColors: state.customColors.filter((color) => color.id !== id),
          primaryColor: state.primaryColor === id ? "red" : state.primaryColor,
        })),
    }),
    {
      name: "bandit-theme", // localStorage 키 이름
    },
  ),
);
