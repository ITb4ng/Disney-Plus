import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

jest.mock("./components/Nav", () => () => <div data-testid="app-nav">Nav</div>);
jest.mock("./components/ScrollManager", () => () => (
  <div data-testid="scroll-manager" />
));
jest.mock("./components/Common/ProtectedRoute", () => {
  const { Outlet } = jest.requireActual("react-router-dom");

  return function MockProtectedRoute() {
    return <Outlet />;
  };
});
jest.mock("./components/Common/PublicOnlyRoute", () => {
  const { Outlet } = jest.requireActual("react-router-dom");

  return function MockPublicOnlyRoute() {
    return <Outlet />;
  };
});
jest.mock("./pages/LandingPage", () => () => <div>Landing Page</div>);
jest.mock("./pages/Login", () => () => <div>Login Page</div>);
jest.mock("./pages/MainPage", () => () => <div>Main Page</div>);
jest.mock("./pages/SearchPage", () => () => <div>Search Page</div>);
jest.mock("./pages/DetailPage", () => () => <div>Detail Page</div>);
jest.mock("./pages/FeedbackPage", () => () => <div>Feedback Page</div>);
jest.mock("./pages/FeedbackPage/FeedbackForm", () => () => (
  <div>Feedback Form</div>
));
jest.mock("./pages/LandingPage/components/Footer/FooterSection", () => () => (
  <div>Footer</div>
));
jest.mock("./pages/NotFound", () => () => <div>Not Found Page</div>);

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    disconnect() {}
    unobserve() {}
  };
});

function renderApp(initialEntries = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
}

describe("App", () => {
  test("renders the landing route with shared layout", () => {
    renderApp(["/"]);

    expect(screen.getByText("Landing Page")).toBeInTheDocument();
    expect(screen.getByTestId("app-nav")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  test("renders protected feedback route inside the app shell", () => {
    renderApp(["/feedback"]);

    expect(screen.getByText("Feedback Page")).toBeInTheDocument();
    expect(screen.getByTestId("app-nav")).toBeInTheDocument();
    expect(screen.queryByText("Footer")).not.toBeInTheDocument();
  });
});
