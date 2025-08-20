import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUserStore } from "../userStore";
import type { User, CreateUserData } from "@src/types/user";
import type { StoredUser } from "../userStore";

// Mock dependencies
vi.mock("@src/utils/userUtils", () => ({
  createStoredUser: vi.fn(),
  verifyUserPassword: vi.fn(),
  findUserByUserId: vi.fn(),
  findUserById: vi.fn(),
  updateUserInArray: vi.fn(),
  toPublicUser: vi.fn(),
}));

describe("useUserStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useUserStore());
    result.current.clearAllUsers();
  });

  it("초기 상태가 올바르게 설정되어야 한다", () => {
    const { result } = renderHook(() => useUserStore());

    expect(result.current.users).toEqual([]);
    expect(result.current.currentUser).toBeNull();
  });

  it("createUser 함수가 올바르게 동작해야 한다", async () => {
    const { result } = renderHook(() => useUserStore());
    const mockStoredUser: StoredUser = { 
      id: "1", 
      userId: "test", 
      nickname: "Test User",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      passwordHash: "hashedPassword"
    };

    const { createStoredUser } = await import("@src/utils/userUtils");
    vi.mocked(createStoredUser).mockResolvedValue(mockStoredUser);

    const userData: CreateUserData = {
      userId: "test",
      password: "password",
      nickname: "Test User"
    };

    await act(async () => {
      await result.current.createUser(userData);
    });

    expect(createStoredUser).toHaveBeenCalledWith(userData);
  });

  it("findUserByUserId 함수가 올바르게 동작해야 한다", async () => {
    const { result } = renderHook(() => useUserStore());
    const mockStoredUser: StoredUser = {
      id: "1",
      userId: "test",
      nickname: "Test User",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      passwordHash: "hashedPassword"
    };

    const { findUserByUserId } = await import("@src/utils/userUtils");
    vi.mocked(findUserByUserId).mockReturnValue(mockStoredUser);

    const foundUser = result.current.findUserByUserId("test");
    expect(findUserByUserId).toHaveBeenCalledWith([], "test");
    expect(foundUser).toBe(mockStoredUser);
  });

  it("findUserById 함수가 올바르게 동작해야 한다", async () => {
    const { result } = renderHook(() => useUserStore());
    const mockStoredUser: StoredUser = {
      id: "1",
      userId: "test",
      nickname: "Test User",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      passwordHash: "hashedPassword"
    };

    const { findUserById } = await import("@src/utils/userUtils");
    vi.mocked(findUserById).mockReturnValue(mockStoredUser);

    const foundUser = result.current.findUserById("1");
    expect(findUserById).toHaveBeenCalledWith([], "1");
    expect(foundUser).toBe(mockStoredUser);
  });

  it("updateUser 함수가 올바르게 동작해야 한다", async () => {
    const { result } = renderHook(() => useUserStore());
    const mockStoredUser: StoredUser = {
      id: "1",
      userId: "test",
      nickname: "Test User",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      passwordHash: "hashedPassword"
    };
    const updatedStoredUser: StoredUser = {
      ...mockStoredUser,
      nickname: "Updated User"
    };

    const { updateUserInArray } = await import("@src/utils/userUtils");
    vi.mocked(updateUserInArray).mockReturnValue({
      updatedUsers: [updatedStoredUser],
      updatedUser: updatedStoredUser
    });

    const updatedUser = result.current.updateUser("1", { nickname: "Updated User" });
    expect(updateUserInArray).toHaveBeenCalledWith([], "1", { nickname: "Updated User" });
    expect(updatedUser).toBe(updatedStoredUser);
  });

  it("verifyPassword 함수가 올바르게 동작해야 한다", async () => {
    const { result } = renderHook(() => useUserStore());

    const { verifyUserPassword } = await import("@src/utils/userUtils");
    vi.mocked(verifyUserPassword).mockResolvedValue(true);

    const isValid = await result.current.verifyPassword("password", "hash");
    expect(verifyUserPassword).toHaveBeenCalledWith("password", "hash");
    expect(isValid).toBe(true);
  });

  it("setCurrentUser 함수가 올바르게 동작해야 한다", () => {
    const { result } = renderHook(() => useUserStore());
    const mockUser: User = {
      id: "1",
      userId: "test",
      nickname: "Test User",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    };

    act(() => {
      result.current.setCurrentUser(mockUser);
    });

    expect(result.current.currentUser).toBe(mockUser);
  });

  it("clearAllUsers 함수가 올바르게 동작해야 한다", () => {
    const { result } = renderHook(() => useUserStore());
    const mockUser: User = {
      id: "1",
      userId: "test",
      nickname: "Test User",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    };

    // 먼저 currentUser 설정
    act(() => {
      result.current.setCurrentUser(mockUser);
    });

    // 모든 사용자 데이터 초기화
    act(() => {
      result.current.clearAllUsers();
    });

    expect(result.current.users).toEqual([]);
    expect(result.current.currentUser).toBeNull();
  });
});
