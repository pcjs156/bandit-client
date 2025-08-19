import { useForm } from "@mantine/form";
import { USER_VALIDATION } from "@src/types/user";
import type { RegisterRequest } from "@src/types/api";

/**
 * 회원가입 폼 검증 및 관리를 위한 커스텀 훅
 */
export function useRegisterForm() {
  return useForm<RegisterRequest>({
    initialValues: {
      userId: "",
      password: "",
      nickname: "",
    },
    validate: {
      userId: (value) => {
        if (!value) return "아이디를 입력해주세요";
        if (value.length < USER_VALIDATION.USER_ID.MIN_LENGTH)
          return `아이디는 ${USER_VALIDATION.USER_ID.MIN_LENGTH}자 이상이어야 합니다`;
        if (value.length > USER_VALIDATION.USER_ID.MAX_LENGTH)
          return `아이디는 ${USER_VALIDATION.USER_ID.MAX_LENGTH}자 이하여야 합니다`;
        if (!USER_VALIDATION.USER_ID.PATTERN.test(value))
          return "아이디는 영문과 숫자만 사용할 수 있습니다";
        return null;
      },
      password: (value) => {
        if (!value) return "비밀번호를 입력해주세요";
        if (value.length < USER_VALIDATION.PASSWORD.MIN_LENGTH)
          return `비밀번호는 ${USER_VALIDATION.PASSWORD.MIN_LENGTH}자 이상이어야 합니다`;
        if (value.length > USER_VALIDATION.PASSWORD.MAX_LENGTH)
          return `비밀번호는 ${USER_VALIDATION.PASSWORD.MAX_LENGTH}자 이하여야 합니다`;
        if (!USER_VALIDATION.PASSWORD.PATTERN.test(value))
          return "비밀번호는 영문과 숫자를 모두 포함해야 합니다";
        return null;
      },
      nickname: (value) => {
        if (!value) return "닉네임을 입력해주세요";
        if (value.length < USER_VALIDATION.NICKNAME.MIN_LENGTH)
          return `닉네임은 ${USER_VALIDATION.NICKNAME.MIN_LENGTH}자 이상이어야 합니다`;
        if (value.length > USER_VALIDATION.NICKNAME.MAX_LENGTH)
          return `닉네임은 ${USER_VALIDATION.NICKNAME.MAX_LENGTH}자 이하여야 합니다`;
        return null;
      },
    },
  });
}
