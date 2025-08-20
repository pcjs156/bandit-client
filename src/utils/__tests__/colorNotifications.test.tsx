import { describe, it, expect, vi, beforeEach } from "vitest";
import { notifications } from "@mantine/notifications";
import {
  showColorAddedSuccess,
  showColorAddedError,
} from "../colorNotifications";

// Mantine notifications 모킹
vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe("colorNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("showColorAddedSuccess", () => {
    it("올바른 파라미터로 notifications.show를 호출해야 한다", () => {
      const colorName = "테스트색상";
      const mockShow = vi.mocked(notifications.show);

      showColorAddedSuccess(colorName);

      expect(mockShow).toHaveBeenCalledWith({
        title: "성공",
        message: `"${colorName}" 색상이 추가되었습니다.`,
        color: "green",
        icon: expect.any(Object),
      });
    });

    it("icon prop이 포함되어야 한다", () => {
      const colorName = "테스트색상";
      const mockShow = vi.mocked(notifications.show);

      showColorAddedSuccess(colorName);

      // notifications.show가 호출되었고, icon prop이 있는지 확인
      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: expect.any(Object),
        }),
      );
    });

    it("여러 번 호출되어도 각각 올바르게 작동해야 한다", () => {
      const colorName = "테스트색상";
      const mockShow = vi.mocked(notifications.show);

      // 3번 연속 호출
      showColorAddedSuccess(colorName);
      showColorAddedSuccess(colorName);
      showColorAddedSuccess(colorName);

      expect(mockShow).toHaveBeenCalledTimes(3);
      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "성공",
          message: `"${colorName}" 색상이 추가되었습니다.`,
        }),
      );
    });
  });

  describe("showColorAddedError", () => {
    it("올바른 파라미터로 notifications.show를 호출해야 한다", () => {
      const mockShow = vi.mocked(notifications.show);

      showColorAddedError();

      expect(mockShow).toHaveBeenCalledWith({
        title: "오류",
        message: "색상 추가 중 오류가 발생했습니다.",
        color: "red",
        icon: expect.any(Object),
      });
    });

    it("icon prop이 포함되어야 한다", () => {
      const mockShow = vi.mocked(notifications.show);

      showColorAddedError();

      // notifications.show가 호출되었고, icon prop이 있는지 확인
      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: expect.any(Object),
        }),
      );
    });

    it("여러 번 호출되어도 각각 올바르게 작동해야 한다", () => {
      const mockShow = vi.mocked(notifications.show);

      // 3번 연속 호출
      showColorAddedError();
      showColorAddedError();
      showColorAddedError();

      expect(mockShow).toHaveBeenCalledTimes(3);
      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "오류",
          message: "색상 추가 중 오류가 발생했습니다.",
        }),
      );
    });
  });

  describe("통합 테스트", () => {
    it("성공과 에러 알림이 모두 올바르게 작동해야 한다", () => {
      const mockShow = vi.mocked(notifications.show);

      // 성공 알림 호출
      showColorAddedSuccess("테스트색상");

      // 에러 알림 호출
      showColorAddedError();

      // 두 번 호출되었는지 확인
      expect(mockShow).toHaveBeenCalledTimes(2);

      // 첫 번째 호출은 성공 알림
      expect(mockShow).toHaveBeenNthCalledWith(1, {
        title: "성공",
        message: '"테스트색상" 색상이 추가되었습니다.',
        color: "green",
        icon: expect.any(Object),
      });

      // 두 번째 호출은 에러 알림
      expect(mockShow).toHaveBeenNthCalledWith(2, {
        title: "오류",
        message: "색상 추가 중 오류가 발생했습니다.",
        color: "red",
        icon: expect.any(Object),
      });
    });
  });
});
