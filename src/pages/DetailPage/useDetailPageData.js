import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import tmdbAxios from "../../api/tmdbaxios";

const VALID_TYPES = ["movie", "tv"];
const DEBUG_STATES = ["loading", "invalid", "empty", "error", "success"];

export function useDetailPageData(type, movieId) {
  const location = useLocation();

  const [pageStatus, setPageStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const debugState = searchParams.get("debugState");
  const debugDelay = Number(searchParams.get("debugDelay") || 0);

  const isDebugState = DEBUG_STATES.includes(debugState);

  const isInvalidParams = useMemo(() => {
    const parsedId = Number(movieId);

    return (
      !VALID_TYPES.includes(type ?? "") ||
      !Number.isInteger(parsedId) ||
      parsedId <= 0
    );
  }, [type, movieId]);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      // 1) 디버그 상태 강제 진입
      if (isDebugState) {
        setData(null);
        setErrorMessage("");

        if (debugState === "loading") {
          setPageStatus("loading");

          if (debugDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, debugDelay));
          }

          if (!alive) return;
          return;
        }

        if (debugState === "invalid") {
          setPageStatus("invalid");
          return;
        }

        if (debugState === "empty") {
          setPageStatus("empty");
          return;
        }

        if (debugState === "error") {
          setErrorMessage("디버그용 에러 상태입니다.");
          setPageStatus("error");
          return;
        }

        // success 강제 진입은 실제 데이터 fetch 후 보여주는 게 더 안전
      }

      // 2) 실제 invalid 검사
      if (isInvalidParams) {
        setData(null);
        setErrorMessage("");
        setPageStatus("invalid");
        return;
      }

      try {
        setPageStatus("loading");
        setErrorMessage("");
        setData(null);

        if (debugDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, debugDelay));
        }

        const res = await tmdbAxios.get("", {
          params: {
            path: `${type}/${movieId}`,
            language: "ko-KR",
            append_to_response: "credits,videos,release_dates,content_ratings",
          },
        });

        if (!alive) return;

        const nextData = res?.data ?? null;
        const hasCoreData =
          !!nextData?.id && !!(nextData?.title || nextData?.name);

        if (!hasCoreData) {
          setData(null);
          setPageStatus("empty");
          return;
        }

        setData(nextData);
        setPageStatus("success");
      } catch (error) {
        if (!alive) return;

        console.error("[DetailPage] fetch failed", error);
        setData(null);
        setErrorMessage("상세 정보를 불러오는 중 문제가 발생했습니다.");
        setPageStatus("error");
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [
    type,
    movieId,
    isInvalidParams,
    retryKey,
    isDebugState,
    debugState,
    debugDelay,
  ]);

  const retry = () => {
    setRetryKey((prev) => prev + 1);
  };

  return {
    pageStatus,
    data,
    errorMessage,
    retryKey,
    retry,
  };
}