import type {
  ValidationTestCase,
  PasswordStrengthTestCase,
} from "../helpers/hookTestHelpers";

/**
 * 공통 테스트 데이터
 */

// 사용자 ID 검증 테스트 케이스
export const userIdValidationCases: ValidationTestCase[] = [
  {
    name: "빈 값이면 에러를 반환해야 한다",
    input: "",
    expectedError: "아이디를 입력해주세요",
  },
  {
    name: "너무 짧으면 에러를 반환해야 한다",
    input: "abc", // 3자
    expectedError: "아이디는 4자 이상이어야 합니다",
  },
  {
    name: "너무 길면 에러를 반환해야 한다",
    input: "a".repeat(21), // 21자
    expectedError: "아이디는 20자 이하여야 합니다",
  },
  {
    name: "영문과 숫자가 아닌 문자가 포함되면 에러를 반환해야 한다",
    input: "test@user",
    expectedError: "아이디는 영문과 숫자만 사용할 수 있습니다",
  },
  {
    name: "유효한 아이디는 에러가 없어야 한다",
    input: "testuser123",
    shouldBeValid: true,
  },
  {
    name: "최소 길이 경계값을 테스트해야 한다",
    input: "test", // 정확히 4자
    shouldBeValid: true,
  },
  {
    name: "최대 길이 경계값을 테스트해야 한다",
    input: "a".repeat(20), // 정확히 20자
    shouldBeValid: true,
  },
];

// 비밀번호 검증 테스트 케이스
export const passwordValidationCases: ValidationTestCase[] = [
  {
    name: "빈 값이면 에러를 반환해야 한다",
    input: "",
    expectedError: "비밀번호를 입력해주세요",
  },
  {
    name: "너무 짧으면 에러를 반환해야 한다",
    input: "pass12", // 6자
    expectedError: "비밀번호는 8자 이상이어야 합니다",
  },
  {
    name: "너무 길면 에러를 반환해야 한다",
    input: "a".repeat(51), // 51자
    expectedError: "비밀번호는 50자 이하여야 합니다",
  },
  {
    name: "영문이 없으면 에러를 반환해야 한다",
    input: "12345678", // 숫자만
    expectedError: "비밀번호는 영문과 숫자를 모두 포함해야 합니다",
  },
  {
    name: "숫자가 없으면 에러를 반환해야 한다",
    input: "password", // 영문만
    expectedError: "비밀번호는 영문과 숫자를 모두 포함해야 합니다",
  },
  {
    name: "유효한 비밀번호는 에러가 없어야 한다",
    input: "password123",
    shouldBeValid: true,
  },
  {
    name: "최소 길이 경계값을 테스트해야 한다",
    input: "pass1234", // 정확히 8자
    shouldBeValid: true,
  },
  {
    name: "최대 길이 경계값을 테스트해야 한다",
    input: "a".repeat(49) + "1", // 정확히 50자
    shouldBeValid: true,
  },
];

// 닉네임 검증 테스트 케이스
export const nicknameValidationCases: ValidationTestCase[] = [
  {
    name: "빈 값이면 에러를 반환해야 한다",
    input: "",
    expectedError: "닉네임을 입력해주세요",
  },
  {
    name: "너무 짧으면 에러를 반환해야 한다",
    input: "a", // 1자
    expectedError: "닉네임은 2자 이상이어야 합니다",
  },
  {
    name: "너무 길면 에러를 반환해야 한다",
    input: "a".repeat(21), // 21자
    expectedError: "닉네임은 20자 이하여야 합니다",
  },
  {
    name: "유효한 닉네임은 에러가 없어야 한다",
    input: "테스트유저",
    shouldBeValid: true,
  },
  {
    name: "최소 길이 경계값을 테스트해야 한다",
    input: "테스", // 정확히 2자
    shouldBeValid: true,
  },
  {
    name: "최대 길이 경계값을 테스트해야 한다",
    input: "a".repeat(20), // 정확히 20자
    shouldBeValid: true,
  },
  {
    name: "한글 닉네임도 허용해야 한다",
    input: "한글닉네임테스트",
    shouldBeValid: true,
  },
  {
    name: "특수문자가 포함된 닉네임도 허용해야 한다",
    input: "nick@name",
    shouldBeValid: true,
  },
];

// 비밀번호 강도 테스트 케이스
export const passwordStrengthCases: PasswordStrengthTestCase[] = [
  {
    name: "빈 문자열은 강도 0이어야 한다",
    password: "",
    expectedStrength: 0,
    expectedLabel: "약함",
    expectedColor: "red",
  },
  {
    name: "8자 미만은 기본 점수만 받아야 한다",
    password: "abc123",
    expectedStrength: 50, // 영문(25) + 숫자(25)
    expectedLabel: "보통",
    expectedColor: "yellow",
  },
  {
    name: "8자 이상은 길이 보너스를 받아야 한다",
    password: "abc12345",
    expectedStrength: 75, // 길이8자(25) + 영문(25) + 숫자(25)
    expectedLabel: "강함",
    expectedColor: "blue",
  },
  {
    name: "12자 이상은 추가 길이 보너스를 받아야 한다",
    password: "abc123456789",
    expectedStrength: 100, // 길이8자(25) + 길이12자(25) + 영문(25) + 숫자(25)
    expectedLabel: "매우 강함",
    expectedColor: "green",
  },
  {
    name: "대문자가 포함되면 추가 점수를 받아야 한다",
    password: "Abc123",
    expectedStrength: 75, // 소문자(25) + 대문자(25) + 숫자(25)
    expectedLabel: "강함",
    expectedColor: "blue",
  },
  {
    name: "특수문자가 포함되면 추가 점수를 받아야 한다",
    password: "abc123!",
    expectedStrength: 75, // 소문자(25) + 숫자(25) + 특수문자(25)
    expectedLabel: "강함",
    expectedColor: "blue",
  },
  {
    name: "모든 조건을 만족하면 최대 점수를 받아야 한다",
    password: "Abc123456789!@#",
    expectedStrength: 100, // 제한된 최대값
    expectedLabel: "매우 강함",
    expectedColor: "green",
  },
  {
    name: "숫자만 있는 비밀번호",
    password: "12345678",
    expectedStrength: 50, // 길이8자(25) + 숫자(25)
    expectedLabel: "보통",
    expectedColor: "yellow",
  },
  {
    name: "영문만 있는 비밀번호",
    password: "abcdefgh",
    expectedStrength: 50, // 길이8자(25) + 소문자(25)
    expectedLabel: "보통",
    expectedColor: "yellow",
  },
  {
    name: "대문자만 있는 비밀번호",
    password: "ABCDEFGH",
    expectedStrength: 50, // 길이8자(25) + 대문자(25)
    expectedLabel: "보통",
    expectedColor: "yellow",
  },
  {
    name: "특수문자만 있는 비밀번호",
    password: "!@#$%^&*",
    expectedStrength: 50, // 길이8자(25) + 특수문자(25)
    expectedLabel: "보통",
    expectedColor: "yellow",
  },
  {
    name: "매우 긴 비밀번호",
    password: "a".repeat(50),
    expectedStrength: 75, // 길이8자(25) + 길이12자(25) + 소문자(25)
    expectedLabel: "강함",
    expectedColor: "blue",
  },
];
