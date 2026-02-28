import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { tmdbImg, pickHeroSize } from "../../utils/tmdbImage";
import tmdbAxios from "../../api/tmdbaxios";
import Row from "../../components/Row";
import requests from "../../api/request";
import "./DetailPage.css";

const FALLBACK = "정보 없음";

const pick = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && String(v).trim() !== "");

const DetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { type, movieId } = useParams();

  const from = location.state?.from;

  const [data, setData] = useState(null);

  /* -------------------------
     Hero Image Size Control
  ------------------------- */
  const [heroSize, setHeroSize] = useState("w1280");

  useEffect(() => {
    const sync = () => setHeroSize(pickHeroSize());
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  /* -------------------------
     Hero State
  ------------------------- */
  const [heroUrl, setHeroUrl] = useState("");
  const [pendingHeroUrl, setPendingHeroUrl] = useState("");
  const [heroLoading, setHeroLoading] = useState(true);

  /* -------------------------
     Scroll Vignette
  ------------------------- */
  const [vignette, setVignette] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const next = Math.min(1, Math.pow(y / 220, 0.85));
      setVignette(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* -------------------------
     Data Fetch + Hero Preload
  ------------------------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setHeroLoading(true);
        const res = await tmdbAxios.get("", {
          params: {
            path: `${type}/${movieId}`,
            language: "ko-KR",
            append_to_response:
              "credits,videos,recommendations,similar,keywords,release_dates,content_ratings",
          },
        });

        if (!alive) return;

        const nextData = res.data;
        setData(nextData);

        const heroPath =
          pick(nextData?.backdrop_path, nextData?.poster_path) ?? "";

        if (!heroPath) {
          setHeroUrl("");
          setHeroLoading(false);
          return;
        }

        const nextHeroUrl = tmdbImg(heroPath, heroSize);

        const img = new Image();
        img.decoding = "async";
        img.src = nextHeroUrl;

        img.onload = () => {
          if (!alive) return;
          setHeroUrl(nextHeroUrl);
          setHeroLoading(false);
        };

        img.onerror = () => {
          if (!alive) return;
          setHeroUrl("");
          setHeroLoading(false);
        };
      } catch (e) {
        if (!alive) return;
        setData(null);
        setHeroUrl("");
        setHeroLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [type, movieId, heroSize]);

  useEffect(() => {
    if (!data) return;

    const heroPath = pick(data.backdrop_path, data.poster_path) ?? "";
    const next = heroPath ? tmdbImg(heroPath, heroSize) : "";

    setPendingHeroUrl(next);
  }, [data, heroSize]);

  // 2) pendingHeroUrl이 바뀌면 "미리 로드"하고, 로드 완료되면 heroUrl 교체
  useEffect(() => {
    if (!pendingHeroUrl) {
      setHeroUrl("");
      setHeroLoading(false);
      return;
    }

    let alive = true;
    setHeroLoading(true);

    const img = new Image();
    img.decoding = "async";
    img.src = pendingHeroUrl;

    img.onload = () => {
      if (!alive) return;
      setHeroUrl(pendingHeroUrl);
      setHeroLoading(false);
    };

    img.onerror = () => {
      if (!alive) return;
      setHeroUrl(""); // 실패 시 배경 제거(혹은 이전 heroUrl 유지해도 됨)
      setHeroLoading(false);
    };

    return () => {
      alive = false;
    };
  }, [pendingHeroUrl]);


  /* -------------------------
     UI Derived Values
  ------------------------- */
  const ui = useMemo(() => {
    const d = data;

    const title =
      pick(d?.title, d?.name, d?.original_title, d?.original_name) ?? FALLBACK;

    const releaseDate = pick(d?.release_date, d?.first_air_date) ?? "";
    const year = releaseDate ? releaseDate.slice(0, 4) : FALLBACK;

    const overview = pick(d?.overview) ?? FALLBACK;

    const genresText =
      Array.isArray(d?.genres) && d.genres.length
        ? d.genres.map((g) => g?.name).filter(Boolean).join(", ")
        : FALLBACK;

    const runtimeMin = (() => {
      if (typeof d?.runtime === "number" && d.runtime > 0)
        return `${d.runtime}분`;

      if (
        Array.isArray(d?.episode_run_time) &&
        d.episode_run_time.length &&
        d.episode_run_time[0] > 0
      )
        return `회당 ${d.episode_run_time[0]}분`;

      return FALLBACK;
    })();

    const director =
      d?.credits?.crew?.find((c) => c?.job === "Director")?.name ?? FALLBACK;

    const cast =
      Array.isArray(d?.credits?.cast) && d.credits.cast.length
        ? d.credits.cast
            .slice(0, 6)
            .map((c) => c?.name)
            .filter(Boolean)
            .join(", ")
        : FALLBACK;

    const ageRating = (() => {
      if (!d) return FALLBACK;

      if (type === "movie") {
        const kr = d?.release_dates?.results?.find(
          (r) => r?.iso_3166_1 === "KR"
        );
        return (
          kr?.release_dates?.find((x) => x?.certification)?.certification ??
          FALLBACK
        );
      }

      return (
        d?.content_ratings?.results?.find((r) => r?.iso_3166_1 === "KR")
          ?.rating ?? FALLBACK
      );
    })();

    return {
      title,
      releaseDate: releaseDate || FALLBACK,
      year,
      overview,
      genresText,
      runtimeMin,
      director,
      cast,
      ageRating,
    };
  }, [data, type]);

  const handleBack = () => {
    if (from) return navigate(from, { replace: true });
    navigate(-1);
  };

  /* =========================
     Render
  ========================= */

  return (
    <div className="detail">
      <section
        className="detail__hero"
        style={{
          backgroundImage: heroUrl ? `url(${heroUrl})` : "none",
          "--vig": vignette,
        }}
      >
        {heroLoading && (
          <div className="detail__heroSk" aria-hidden="true">
            <div className="detail__heroSkShimmer" />
          </div>
        )}

        <div className="detail__vignette" />

        <div className="detail__heroInner">
          <div className="detail__left">
            <div className="detail__micro">
              <span className="detail__microStrong">100% for you</span>
              <span className="detail__microDot">•</span>
              <span>{ui.releaseDate}</span>
            </div>

            <h1 className="detail__title">{ui.title}</h1>

            <div className="detail__metaRow">
              <span className="pill pill--age">{ui.ageRating}</span>
              <span className="metaText">{ui.year}</span>
              <span className="dot" />
              <span className="metaText">{ui.runtimeMin}</span>
              <span className="dot" />
              <span className="metaText">{ui.genresText}</span>
            </div>

            <div className="detail__actions">
              <button className="btn btn--primary">디즈니+ 가입</button>
            </div>
          </div>

          <div className="detail__wideSection">
            <div className="detail__divider" />
            <div className="detail__sectionLabel">상세 정보</div>

            <div className="detail__infoGrid3 detail__infoGrid3--clean">
              <div className="detail__infoCol detail__infoCol--main">
                <h2 className="detail__infoTitle">{ui.title}</h2>
                <p className="detail__infoBody">{ui.overview}</p>
              </div>

              <dl className="detail__facts detail__facts--stack">
                <div className="fact">
                  <dt>감독:</dt>
                  <dd>{ui.director}</dd>
                </div>
                <div className="fact">
                  <dt>출연:</dt>
                  <dd>{ui.cast}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="detail__below">
        <div className="detailRowScope">
          <Row
            title="자주 찾는 콘텐츠"
            id="detail-toprated"
            fetchUrl={requests.fetchTop10KR}
            mode="navigate"
            navType="movie"
            onNavigate={(movie) => {
              navigate(`/detail/movie/${movie.id}`, { replace: true });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      </section>

      <div className="detail__backWrap">
        <button className="btn btn--primary" onClick={handleBack}>
          뒤로가기
        </button>
      </div>
    </div>
  );
};

export default DetailPage;