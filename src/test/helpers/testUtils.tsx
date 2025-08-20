import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";

interface TestWrapperProps {
  children: ReactNode;
}

const TestWrapper = ({ children }: TestWrapperProps) => {
  return (
    <MantineProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </MantineProvider>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { wrapper: TestWrapperComponent = TestWrapper, ...renderOptions } =
    options;

  return render(ui, {
    wrapper: TestWrapperComponent,
    ...renderOptions,
  });
};

export * from "@testing-library/react";
export { customRender as render };
export { TestWrapper };
