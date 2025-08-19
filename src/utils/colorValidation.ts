import type { CustomColor } from "@src/stores/themeStore";

/**
 * 색상 이름 검증 함수
 * @param name 검증할 색상 이름
 * @param existingColors 기존 커스텀 색상 목록
 * @returns 에러 메시지 또는 null (유효한 경우)
 */
export const validateColorName = (
  name: string,
  existingColors: CustomColor[],
): string | null => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "색상 이름을 입력해주세요.";
  }

  if (trimmedName.length > 20) {
    return "색상 이름은 20자 이하로 입력해주세요.";
  }

  if (
    existingColors.some(
      (color) => color.name.toLowerCase() === trimmedName.toLowerCase(),
    )
  ) {
    return "이미 존재하는 색상 이름입니다.";
  }

  return null;
};

/**
 * 색상 값 검증 함수 (hex 형식)
 * @param color 검증할 색상 값
 * @returns 에러 메시지 또는 null (유효한 경우)
 */
export const validateColorValue = (color: string): string | null => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexRegex.test(color)) {
    return "올바른 hex 색상 형식이 아닙니다.";
  }
  return null;
};

/**
 * 색상 추가 시 전체 검증
 * @param name 색상 이름
 * @param color 색상 값
 * @param existingColors 기존 커스텀 색상 목록
 * @returns 첫 번째 에러 메시지 또는 null (모두 유효한 경우)
 */
export const validateColorInput = (
  name: string,
  color: string,
  existingColors: CustomColor[],
): string | null => {
  const nameError = validateColorName(name, existingColors);
  if (nameError) return nameError;

  const colorError = validateColorValue(color);
  if (colorError) return colorError;

  return null;
};
