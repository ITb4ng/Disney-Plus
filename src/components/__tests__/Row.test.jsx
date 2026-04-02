import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Row from "../Row";
import tmdbAxios from "../../api/tmdbaxios";
import { useAuth } from "../../contexts/AuthContext";
import {
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";

jest.mock("../../api/tmdbaxios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock("../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
  useNavigationType: jest.fn(),
}));

jest.mock("../MovieModal", () => {
  return function MockMovieModal(props) {
    return (
      <div data-testid="movie-modal">
        <button type="button" onClick={() => props.setModalOpen(false)}>
          모달 닫기
        </button>
      </div>
    );
  };
});

jest.mock("swiper/css", () => ({}), { virtual: true });

jest.mock(
  "swiper/modules",
  () => ({
    A11y: {},
  }),
  { virtual: true }
);

jest.mock(
  "swiper/react",
  () => {
    const React = require("react");

    function Swiper({ children, onSwiper, onSlideChange }) {
      const [activeIndex, setActiveIndex] = React.useState(0);
      const swiperInstanceRef = React.useRef(null);
      const onSwiperRef = React.useRef(onSwiper);
      const onSlideChangeRef = React.useRef(onSlideChange);

      onSwiperRef.current = onSwiper;
      onSlideChangeRef.current = onSlideChange;

      if (!swiperInstanceRef.current) {
        swiperInstanceRef.current = {
          activeIndex: 0,
          isBeginning: true,
          isEnd: false,
          destroyed: false,
          translate: 0,
          progress: 0,
          slides: React.Children.toArray(children),

          update() {},

          updateProgress(value) {
            if (typeof value === "number") {
              this.progress = value;
            }
          },

          updateActiveIndex() {
            if (typeof this.translate === "number") {
              const raw = Math.abs(this.translate / 100);
              const max = Math.max(0, (this.slides?.length || 1) - 1);
              const next = Math.max(0, Math.min(Math.round(raw), max));
              this.activeIndex = next;
              this.isBeginning = next === 0;
              this.isEnd = next === max;
              setActiveIndex(next);
            }
          },

          updateSlidesClasses() {},

          minTranslate() {
            return -9999;
          },

          maxTranslate() {
            return 0;
          },

          setTranslate(value) {
            this.translate = Number(value) || 0;
          },

          setProgress(value) {
            const max = Math.max(0, (this.slides?.length || 1) - 1);
            const next = Math.max(0, Math.min(Math.round(value * max), max));
            this.activeIndex = next;
            this.isBeginning = next === 0;
            this.isEnd = next === max;
            this.translate = -next * 100;
            this.progress = value;
            setActiveIndex(next);
          },

          slideNext() {
            const max = Math.max(0, (this.slides?.length || 1) - 1);
            const next = Math.min(this.activeIndex + 1, max);

            this.activeIndex = next;
            this.isBeginning = next === 0;
            this.isEnd = next === max;
            this.translate = -next * 100;
            this.progress = max > 0 ? next / max : 0;

            setActiveIndex(next);
            onSlideChangeRef.current?.(this);
          },

          slidePrev() {
            const max = Math.max(0, (this.slides?.length || 1) - 1);
            const next = Math.max(this.activeIndex - 1, 0);

            this.activeIndex = next;
            this.isBeginning = next === 0;
            this.isEnd = next === max;
            this.translate = -next * 100;
            this.progress = max > 0 ? next / max : 0;

            setActiveIndex(next);
            onSlideChangeRef.current?.(this);
          },

          slideTo(index) {
            const max = Math.max(0, (this.slides?.length || 1) - 1);
            const next = Math.max(0, Math.min(index, max));

            this.activeIndex = next;
            this.isBeginning = next === 0;
            this.isEnd = next === max;
            this.translate = -next * 100;
            this.progress = max > 0 ? next / max : 0;

            setActiveIndex(next);
            onSlideChangeRef.current?.(this);
          },
        };
      }

      React.useEffect(() => {
        swiperInstanceRef.current.slides = React.Children.toArray(children);
      }, [children]);

      React.useEffect(() => {
        onSwiperRef.current?.(swiperInstanceRef.current);
      }, []);

      return (
        <div data-testid="swiper" data-active-index={String(activeIndex)}>
          {React.Children.map(children, (child, index) => (
            <div
              key={index}
              data-testid="swiper-slide"
              data-active={index === activeIndex ? "1" : "0"}
            >
              {child}
            </div>
          ))}
        </div>
      );
    }

    function SwiperSlide({ children }) {
      return <div>{children}</div>;
    }

    return { Swiper, SwiperSlide };
  },
  { virtual: true }
);

const mockedUseAuth = useAuth;
const mockedUseLocation = useLocation;
const mockedUseNavigate = useNavigate;
const mockedUseNavigationType = useNavigationType;

const navigateMock = jest.fn();
const ROW_SWIPE_KEY = "row:swipe:v1";

const mockResults = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  title: `Movie ${index + 1}`,
  release_date: `2024-01-0${(index % 9) + 1}`,
  backdrop_path: `/backdrop-${index + 1}.jpg`,
  poster_path: `/poster-${index + 1}.jpg`,
  media_type: "movie",
}));

function setLocation({
  pathname = "/main",
  search = "",
  key = "row-test-key",
  state = null,
} = {}) {
  mockedUseLocation.mockReturnValue({
    pathname,
    search,
    key,
    state,
  });
}

function setNavigationType(type = "PUSH") {
  mockedUseNavigationType.mockReturnValue(type);
}

function setNavigationEntryType(type = "navigate") {
  Object.defineProperty(window, "performance", {
    configurable: true,
    value: {
      getEntriesByType: jest.fn(() => [{ type }]),
    },
  });
}

function setMatchMedia(matcher = () => false) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: matcher(query),
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

function readSwipeMap() {
  try {
    return JSON.parse(sessionStorage.getItem(ROW_SWIPE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeSwipeState(key, value) {
  const prev = readSwipeMap();
  prev[key] = value;
  sessionStorage.setItem(ROW_SWIPE_KEY, JSON.stringify(prev));
}

async function flushAsync() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("Row", () => {
  beforeEach(() => {
    cleanup();
    sessionStorage.clear();

    mockedUseAuth.mockReturnValue({
      userData: { uid: "user-1" },
    });

    mockedUseNavigate.mockReturnValue(navigateMock);
    navigateMock.mockReset();

    setLocation();
    setNavigationType("PUSH");
    setNavigationEntryType("navigate");

    tmdbAxios.get.mockReset();
    tmdbAxios.get.mockResolvedValue({
      data: { results: mockResults },
    });

    setMatchMedia(() => false);
    Object.defineProperty(window.navigator, "maxTouchPoints", {
      configurable: true,
      value: 0,
    });

    global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
    global.cancelAnimationFrame = (id) => clearTimeout(id);
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test("최초 렌더 시 첫 페이지에서 시작한다", async () => {
    render(
      <Row title="Top Rated" id="TR" fetchUrl={{ path: "movie/top_rated" }} />
    );

    await flushAsync();

    await waitFor(() => {
      expect(tmdbAxios.get).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId("swiper")).toHaveAttribute("data-active-index", "0");
  });

  test("화살표 클릭 시 페이지 상태가 저장된다", async () => {
    render(
      <Row title="Top Rated" id="TR" fetchUrl={{ path: "movie/top_rated" }} />
    );

    await flushAsync();

    const nextButton = await screen.findByLabelText("다음 콘텐츠");
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    await waitFor(() => {
      const map = readSwipeMap();
      expect(map["/main::TR"]?.activeIndex).toBe(2);
    });

    expect(screen.getByTestId("swiper")).toHaveAttribute("data-active-index", "2");
  });

  test("새로고침 진입 시 저장된 페이지로 복원된다", async () => {
    writeSwipeState("/main::TR", {
      activeIndex: 3,
      translate: -300,
      progress: 0.6,
    });

    setNavigationEntryType("reload");

    render(
      <Row title="Top Rated" id="TR" fetchUrl={{ path: "movie/top_rated" }} />
    );

    await flushAsync();
    await flushAsync();

    await waitFor(() => {
      expect(screen.getByTestId("swiper")).toHaveAttribute("data-active-index", "3");
    });
  });

  test("여러 Row는 각자 독립적으로 페이지 상태를 유지한다", async () => {
    render(
      <>
        <Row title="Top Rated" id="TR" fetchUrl={{ path: "movie/top_rated" }} />
        <Row title="Comedy Movies" id="CM" fetchUrl={{ path: "movie/comedy" }} />
      </>
    );

    await flushAsync();

    const nextButtons = await screen.findAllByLabelText("다음 콘텐츠");

    fireEvent.click(nextButtons[0]);
    fireEvent.click(nextButtons[0]);
    fireEvent.click(nextButtons[1]);

    await waitFor(() => {
      const map = readSwipeMap();
      expect(map["/main::TR"].activeIndex).toBe(2);
    });

    expect(readSwipeMap()["/main::CM"].activeIndex).toBe(1);
  });

  test("같은 query로 재마운트되면 데이터를 다시 요청하지 않는다", async () => {
    const uniqueFetchUrl = {
      path: "movie/top_rated",
      cacheKey: "row-cache-remount-test",
    };

    const view = render(
      <Row title="Top Rated" id="TR" fetchUrl={uniqueFetchUrl} />
    );

    await flushAsync();

    await waitFor(() => {
      expect(tmdbAxios.get).toHaveBeenCalledTimes(1);
    });

    view.unmount();

    render(
      <Row title="Top Rated" id="TR" fetchUrl={uniqueFetchUrl} />
    );

    await flushAsync();

    expect(tmdbAxios.get).toHaveBeenCalledTimes(1);
  });

  test("모달을 열고 닫아도 페이지 상태는 유지된다", async () => {
    render(
      <Row title="Top Rated" id="TR" fetchUrl={{ path: "movie/top_rated" }} />
    );

    await flushAsync();

    const nextButton = await screen.findByLabelText("다음 콘텐츠");
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    expect(screen.getByTestId("swiper")).toHaveAttribute("data-active-index", "2");

    const cards = await screen.findAllByTestId("row-card");
    fireEvent.click(cards[0]);

    expect(screen.getByTestId("movie-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "모달 닫기" }));

    await waitFor(() => {
      expect(screen.queryByTestId("movie-modal")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("swiper")).toHaveAttribute("data-active-index", "2");
  });

  test("POP 진입 시 저장된 페이지 상태를 복원한다", async () => {
    writeSwipeState("/main::TR", {
      activeIndex: 1,
      translate: -100,
      progress: 0.2,
    });

    setNavigationType("POP");

    render(
      <Row title="Top Rated" id="TR" fetchUrl={{ path: "movie/top_rated" }} />
    );

    await flushAsync();
    await flushAsync();

    await waitFor(() => {
      expect(screen.getByTestId("swiper")).toHaveAttribute("data-active-index", "1");
    });
  });

  test("mode가 navigate일 때 카드 클릭 시 detail 경로로 이동한다", async () => {
    render(
      <Row
        title="Top Rated"
        id="TR"
        fetchUrl={{ path: "movie/top_rated" }}
        mode="navigate"
      />
    );

    await flushAsync();

    const cards = await screen.findAllByTestId("row-card");
    fireEvent.click(cards[0]);

    expect(navigateMock).toHaveBeenCalled();
    expect(navigateMock.mock.calls[0][0]).toBe("/detail/movie/1");
  });
  test("터치 가능한 데스크톱에서는 터치 전용 swiper 모드로 전환한다", async () => {
    setMatchMedia((query) => query === "(any-pointer: coarse)");
    Object.defineProperty(window.navigator, "maxTouchPoints", {
      configurable: true,
      value: 1,
    });

    render(
      <Row title="Top Rated" id="TR" fetchUrl={{ path: "movie/top_rated" }} />
    );

    await flushAsync();

    await waitFor(() => {
      expect(screen.getByTestId("row-shell")).toHaveAttribute("data-touch", "1");
    });

    expect(screen.queryByTestId("row-prev-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("row-next-button")).not.toBeInTheDocument();
  });
});
