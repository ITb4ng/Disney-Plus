import React from "react";
import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import PublicOnlyRoute from "../PublicOnlyRoute";
import { useAuth } from "../../../contexts/AuthContext";

jest.mock("../../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth;

function DetailSpy() {
  const location = useLocation();
  const params = useParams();

  return (
    <>
      <div data-testid="detail-path">{`${location.pathname}|${params.type}|${params.movieId}`}</div>
      <div data-testid="detail-state">{JSON.stringify(location.state ?? {})}</div>
    </>
  );
}

describe("PublicOnlyRoute", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  test("로그인 직후 detail intent가 있으면 /main 대신 detail로 보낸다", async () => {
    mockedUseAuth.mockReturnValue({
      userData: { uid: "user-1" },
      authLoading: false,
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/login",
            state: {
              intent: "detail",
              detailId: 55,
              detailType: "movie",
              from: "/",
              teaserSource: "top10",
              detailTitle: "Movie 55",
              detailBackdrop: "/backdrop.jpg",
              detailPoster: "/poster.jpg",
              detailDebugState: "cdn-fail",
              scrollY: 320,
            },
          },
        ]}
      >
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>login</div>} />
          </Route>
          <Route path="/main" element={<div data-testid="main-page">main</div>} />
          <Route path="/detail/:type/:movieId" element={<DetailSpy />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByTestId("detail-path")).toHaveTextContent(
      "/detail/movie/55|movie|55"
    );
    expect(screen.queryByTestId("main-page")).toBeNull();
    expect(screen.getByTestId("detail-state")).toHaveTextContent('"from":"/"');
    expect(screen.getByTestId("detail-state")).toHaveTextContent('"teaserSource":"top10"');
    expect(screen.getByTestId("detail-state")).toHaveTextContent('"scrollY":320');
  });

  test("로그인 상태에서 일반 /login 접근은 /main으로 보낸다", async () => {
    mockedUseAuth.mockReturnValue({
      userData: { uid: "user-1" },
      authLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>login</div>} />
          </Route>
          <Route path="/main" element={<div data-testid="main-page">main</div>} />
          <Route path="/detail/:type/:movieId" element={<DetailSpy />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByTestId("main-page")).toBeInTheDocument();
    expect(screen.queryByTestId("detail-path")).toBeNull();
  });
});
