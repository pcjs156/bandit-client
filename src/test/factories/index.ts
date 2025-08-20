/**
 * 테스트 데이터 팩토리 함수들
 * 테스트 데이터 생성을 체계화하고 재사용성을 높입니다.
 */

// 사용자 관련 테스트 데이터 팩토리
export const createUser = (
  overrides: Partial<{
    userId: string;
    password: string;
    nickname: string;
    email?: string;
  }> = {},
) => ({
  userId: "testuser123",
  password: "password123",
  nickname: "테스트유저",
  ...overrides,
});

export const createInvalidUser = (
  field: "userId" | "password" | "nickname",
  type: "empty" | "tooShort" | "tooLong" | "invalidFormat",
) => {
  const invalidValues = {
    userId: {
      empty: "",
      tooShort: "abc",
      tooLong: "a".repeat(21),
      invalidFormat: "test@user",
    },
    password: {
      empty: "",
      tooShort: "pass12",
      tooLong: "a".repeat(51),
      invalidFormat: "12345678", // 영문 없음
    },
    nickname: {
      empty: "",
      tooShort: "a",
      tooLong: "a".repeat(21),
      invalidFormat: "", // 닉네임은 특별한 제한 없음
    },
  };

  return createUser({ [field]: invalidValues[field][type] });
};

// 비밀번호 강도 테스트 데이터 팩토리
export const createPasswordStrengthTest = (
  password: string,
  expectedStrength: number,
  expectedLabel: string,
  expectedColor: string,
) => ({
  password,
  expectedStrength,
  expectedLabel,
  expectedColor,
});

export const createPasswordStrengthCases = () => [
  createPasswordStrengthTest("", 0, "약함", "red"),
  createPasswordStrengthTest("abc123", 50, "보통", "yellow"),
  createPasswordStrengthTest("abc12345", 75, "강함", "blue"),
  createPasswordStrengthTest("Abc123", 75, "강함", "blue"),
  createPasswordStrengthTest("Password123!", 100, "매우 강함", "green"),
];

// 폼 검증 테스트 데이터 팩토리
export const createValidationTest = (
  input: string,
  expectedError?: string,
  shouldBeValid: boolean = false,
) => ({
  input,
  expectedError,
  shouldBeValid,
});

export const createUserIdValidationCases = () => [
  createValidationTest("", "아이디를 입력해주세요"),
  createValidationTest("abc", "아이디는 4자 이상이어야 합니다"),
  createValidationTest("a".repeat(21), "아이디는 20자 이하여야 합니다"),
  createValidationTest(
    "test@user",
    "아이디는 영문과 숫자만 사용할 수 있습니다",
  ),
  createValidationTest("testuser123", undefined, true),
  createValidationTest("test", undefined, true), // 경계값
  createValidationTest("a".repeat(20), undefined, true), // 경계값
];

export const createPasswordValidationCases = () => [
  createValidationTest("", "비밀번호를 입력해주세요"),
  createValidationTest("pass12", "비밀번호는 8자 이상이어야 합니다"),
  createValidationTest("a".repeat(51), "비밀번호는 50자 이하여야 합니다"),
  createValidationTest(
    "12345678",
    "비밀번호는 영문과 숫자를 모두 포함해야 합니다",
  ),
  createValidationTest(
    "password",
    "비밀번호는 영문과 숫자를 모두 포함해야 합니다",
  ),
  createValidationTest("password123", undefined, true),
  createValidationTest("pass1234", undefined, true), // 경계값
  createValidationTest("a".repeat(49) + "1", undefined, true), // 경계값
];

export const createNicknameValidationCases = () => [
  createValidationTest("", "닉네임을 입력해주세요"),
  createValidationTest("a", "닉네임은 2자 이상이어야 합니다"),
  createValidationTest("a".repeat(21), "닉네임은 20자 이하여야 합니다"),
  createValidationTest("테스트유저", undefined, true),
  createValidationTest("테스", undefined, true), // 경계값
  createValidationTest("a".repeat(20), undefined, true), // 경계값
  createValidationTest("한글닉네임테스트", undefined, true),
  createValidationTest("nick@name", undefined, true),
];

// 컴포넌트 테스트 데이터 팩토리
export const createComponentTestProps = (
  overrides: Record<string, unknown> = {},
) => ({
  // 기본 컴포넌트 props
  ...overrides,
});

// API 응답 테스트 데이터 팩토리
export const createApiResponse = <T>(
  data: T,
  success: boolean = true,
  message?: string,
) => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString(),
});

export const createErrorResponse = (message: string, code?: string) => ({
  success: false,
  error: {
    message,
    code,
    timestamp: new Date().toISOString(),
  },
});

// 색상 테스트 데이터 팩토리
export const createColorTest = (
  name: string,
  hex: string,
  isCustom: boolean = false,
) => ({
  name,
  hex,
  isCustom,
});

export const createThemeColors = () => [
  createColorTest("파란색", "#228be6"),
  createColorTest("초록색", "#40c057"),
  createColorTest("노란색", "#ffd43b"),
  createColorTest("빨간색", "#fa5252"),
  createColorTest("보라색", "#7950f2"),
];

// 테스트 환경 설정 팩토리
export const createTestConfig = (
  overrides: Partial<{
    enableLogging: boolean;
    mockApi: boolean;
    testTimeout: number;
  }> = {},
) => ({
  enableLogging: false,
  mockApi: true,
  testTimeout: 5000,
  ...overrides,
});
