import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

/**
 * 색상 추가 성공 알림
 * @param colorName 추가된 색상 이름
 */
export const showColorAddedSuccess = (colorName: string) => {
  notifications.show({
    title: "성공",
    message: `"${colorName}" 색상이 추가되었습니다.`,
    color: "green",
    icon: <IconCheck size={18} />,
  });
};

/**
 * 색상 추가 실패 알림
 */
export const showColorAddedError = () => {
  notifications.show({
    title: "오류",
    message: "색상 추가 중 오류가 발생했습니다.",
    color: "red",
    icon: <IconX size={18} />,
  });
};
