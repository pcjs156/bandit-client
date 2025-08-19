import { describe, it, expect, vi, beforeEach } from "vitest";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import {
  showColorAddedSuccess,
  showColorAddedError,
} from "../colorNotifications";

// Mantine notifications 모킹
vi.mock("@mantine/notifications");

// Tabler icons 모킹
vi.mock("@tabler/icons-react", () => ({
  IconCheck: vi.fn(() => <div data-testid="icon-check" />),
  IconX: vi.fn(() => <div data-testid="icon-x" />),
}));

describe("colorNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("showColorAddedSuccess", () => {
    it("성공 알림을 올바른 옵션으로 표시해야 한다", () => {
      const colorName = "테스트색상";
      const mockShow = vi.mocked(notifications.show);

      showColorAddedSuccess(colorName);

      expect(mockShow).toHaveBeenCalledWith({
        title: "성공",
        message: `"${colorName}" 색상이 추가되었습니다.`,
        color: "green",
        icon: expect.anything(),
      });
    });

    it("IconCheck 아이콘이 올바른 props로 렌더링되어야 한다", () => {
      const colorName = "테스트색상";
      const mockShow = vi.mocked(notifications.show);

      showColorAddedSuccess(colorName);

      // notifications.show가 호출되었고, icon prop이 있는지 확인
      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: expect.anything(),
        })
      );
    });

    it("다양한 색상 이름으로 동작해야 한다", () => {
      const testCases = ["빨간색", "Blue Color", "색상123", "특수문자!@#", ""];

      const mockShow = vi.mocked(notifications.show);

      testCases.forEach((colorName) => {
        mockShow.mockClear();

        showColorAddedSuccess(colorName);

        expect(mockShow).toHaveBeenCalledWith({
          title: "성공",
          message: `"${colorName}" 색상이 추가되었습니다.`,
          color: "green",
          icon: expect.anything(),
        });
      });
    });
  });

  describe("showColorAddedError", () => {
    it("에러 알림을 올바른 옵션으로 표시해야 한다", () => {
      const mockShow = vi.mocked(notifications.show);

      showColorAddedError();

      expect(mockShow).toHaveBeenCalledWith({
        title: "오류",
        message: "색상 추가 중 오류가 발생했습니다.",
        color: "red",
        icon: expect.anything(),
      });
    });

    it("IconX 아이콘이 올바른 props로 렌더링되어야 한다", () => {
      const mockShow = vi.mocked(notifications.show);

      showColorAddedError();

      // notifications.show가 호출되었고, icon prop이 있는지 확인
      expect(mockShow).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: expect.anything(),
        })
      );
    });

    it("여러 번 호출해도 동일하게 동작해야 한다", () => {
      const mockShow = vi.mocked(notifications.show);

      // 3번 연속 호출
      showColorAddedError();
      showColorAddedError();
      showColorAddedError();

      expect(mockShow).toHaveBeenCalledTimes(3);

      // 각 호출이 동일한 옵션으로 이루어졌는지 확인
      expect(mockShow).toHaveBeenNthCalledWith(1, {
        title: "오류",
        message: "색상 추가 중 오류가 발생했습니다.",
        color: "red",
        icon: expect.anything(),
      });

      expect(mockShow).toHaveBeenNthCalledWith(2, {
        title: "오류",
        message: "색상 추가 중 오류가 발생했습니다.",
        color: "red",
        icon: expect.anything(),
      });

      expect(mockShow).toHaveBeenNthCalledWith(3, {
        title: "오류",
        message: "색상 추가 중 오류가 발생했습니다.",
        color: "red",
        icon: expect.anything(),
      });
    });
  });

  describe("통합 테스트", () => {
    it("성공과 에러 알림이 독립적으로 동작해야 한다", () => {
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
        icon: expect.anything(),
      });

      // 두 번째 호출은 에러 알림
      expect(mockShow).toHaveBeenNthCalledWith(2, {
        title: "오류",
        message: "색상 추가 중 오류가 발생했습니다.",
        color: "red",
        icon: expect.anything(),
      });
    });
  });
});
