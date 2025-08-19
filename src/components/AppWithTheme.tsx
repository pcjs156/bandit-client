import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useMemo } from "react";
import type { MantineColorsTuple } from "@mantine/core";
import App from "@src/App.tsx";
import { useThemeStore } from "@src/stores/themeStore";

function AppWithTheme() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const primaryColor = useThemeStore((state) => state.primaryColor);
  const customColors = useThemeStore((state) => state.customColors);

  // 커스텀 색상들을 테마에 추가 (메모이제이션)
  const customColorsTheme = useMemo(() => {
    return customColors.reduce(
      (acc, color) => {
        acc[color.id] = color.shades as MantineColorsTuple;
        return acc;
      },
      {} as Record<string, MantineColorsTuple>,
    );
  }, [customColors]);

  const theme = useMemo(() => {
    return createTheme({
      primaryColor: primaryColor,
      colors: customColorsTheme,
    });
  }, [primaryColor, customColorsTheme]);

  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      <Notifications />
      <App />
    </MantineProvider>
  );
}

export default AppWithTheme;
