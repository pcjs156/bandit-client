import { useMemo } from "react";

/**
 * 비밀번호 강도 관련 타입
 */
export interface PasswordStrength {
  strength: number;
  label: string;
  color: string;
}

/**
 * 비밀번호 강도를 계산하고 관리하는 커스텀 훅
 */
export function usePasswordStrength(password: string): PasswordStrength {
  return useMemo(() => {
    let strength = 0;

    // 길이 기반 점수
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;

    // 문자 종류 기반 점수
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    const finalStrength = Math.min(100, strength);

    // 강도에 따른 라벨과 색상
    let label: string;
    let color: string;

    if (finalStrength < 30) {
      label = "약함";
      color = "red";
    } else if (finalStrength < 60) {
      label = "보통";
      color = "yellow";
    } else if (finalStrength < 80) {
      label = "강함";
      color = "blue";
    } else {
      label = "매우 강함";
      color = "green";
    }

    return {
      strength: finalStrength,
      label,
      color,
    };
  }, [password]);
}
