/**
 * 색상 대비 검증 유틸리티
 * WCAG 2.1 AA 기준 (4.5:1) 및 AAA 기준 (7:1)을 기반으로 함
 */

/**
 * Hex 색상을 RGB로 변환
 * @param hex Hex 색상 값 (예: "#ff0000")
 * @returns RGB 값 객체
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * RGB를 상대 휘도(relative luminance)로 변환
 * @param r 빨강 (0-255)
 * @param g 초록 (0-255)
 * @param b 파랑 (0-255)
 * @returns 상대 휘도 값 (0-1)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * 두 색상 간의 대비 비율 계산
 * @param color1 첫 번째 색상 (hex)
 * @param color2 두 번째 색상 (hex)
 * @returns 대비 비율 (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * 색상이 WCAG AA 기준을 만족하는지 확인
 * @param foreground 전경색 (hex)
 * @param background 배경색 (hex, 기본값: 흰색)
 * @returns AA 기준 만족 여부
 */
export function meetsWCAG_AA(
  foreground: string,
  background: string = "#ffffff",
): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

/**
 * 색상이 WCAG AAA 기준을 만족하는지 확인
 * @param foreground 전경색 (hex)
 * @param background 배경색 (hex, 기본값: 흰색)
 * @returns AAA 기준 만족 여부
 */
export function meetsWCAG_AAA(
  foreground: string,
  background: string = "#ffffff",
): boolean {
  return getContrastRatio(foreground, background) >= 7;
}

/**
 * 색상의 접근성 등급 반환
 * @param foreground 전경색 (hex)
 * @param background 배경색 (hex, 기본값: 흰색)
 * @returns 접근성 등급
 */
export function getAccessibilityGrade(
  foreground: string,
  background: string = "#ffffff",
): "AAA" | "AA" | "FAIL" {
  const ratio = getContrastRatio(foreground, background);

  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "FAIL";
}

/**
 * 접근성 등급에 따른 색상 반환
 * @param grade 접근성 등급
 * @returns 해당 등급의 색상
 */
export function getGradeColor(grade: "AAA" | "AA" | "FAIL"): string {
  switch (grade) {
    case "AAA":
      return "green";
    case "AA":
      return "yellow";
    case "FAIL":
      return "red";
  }
}
