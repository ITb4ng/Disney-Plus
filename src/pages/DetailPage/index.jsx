import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import tmdbAxios from "../../api/tmdbaxios";
import requests from "../../api/request";
import Row from "../../components/Row";
import { tmdbImg, pickHeroSize } from "../../utils/tmdbImage";

import "./DetailPage.css";

const FALLBACK = "정보 없음";

const pick = (...vals) =>
  vals.find((v) => v !== undefined && v !== null && String(v).trim() !== "");

export default function DetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { type, movieId } = useParams();

  const from = location.state?.from;

  const [data, setData] = useState(null);

  // ✅ related(비슷한 콘텐츠) 로드 결과 추적 (트레일러는 있는데 related 0개면 fallback)
  const [relatedLoaded, setRelatedLoaded] = useState(false);
  const [relatedCount, setRelatedCount] = useState(0);

  useEffect(() => {
    setRelatedLoaded(false);
    setRelatedCount(0);
  }, [type, movieId]);

  /* -------------------------
     SEO
  ------------------------- */
  const siteName = "Disney+ Renewal";
  const baseUrl = "https://b4ng-disney-plus.vercel.app";
  const canonicalUrl = `${baseUrl}/detail/${type}/${movieId}`;

  const titleText = data?.title || data?.name || "콘텐츠 상세";
  const overviewText = data?.overview
    ? data.overview.replace(/\s+/g, " ").trim().slice(0, 160)
    : "Disney+ UI/UX Renewal 기반 클론 프로젝트 상세 페이지입니다.";

  const ogImagePath = data?.backdrop_path || data?.poster_path;
  const ogImageUrl = ogImagePath
    ? `https://image.tmdb.org/t/p/w780${ogImagePath}`
    : `${baseUrl}/og-image.jpg`;

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
     Hero preload
  ------------------------- */
  const [heroUrl, setHeroUrl] = useState("");
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
     Fetch Detail + preload hero
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
            append_to_response: "credits,videos,release_dates,content_ratings",
          },
        });

        if (!alive) return;

        const nextData = res.data;
        setData(nextData);

        const heroPath = pick(nextData?.backdrop_path, nextData?.poster_path) ?? "";
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
        console.error("[DetailPage] fetch failed", e);
        setData(null);
        setHeroUrl("");
        setHeroLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [type, movieId, heroSize]);

  /* -------------------------
     UI Derived
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
      if (typeof d?.runtime === "number" && d.runtime > 0) return `${d.runtime}분`;

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

    const castText =
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
        const kr = d?.release_dates?.results?.find((r) => r?.iso_3166_1 === "KR");
        return (
          kr?.release_dates?.find((x) => x?.certification)?.certification ?? FALLBACK
        );
      }

      return (
        d?.content_ratings?.results?.find((r) => r?.iso_3166_1 === "KR")?.rating ??
        FALLBACK
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
      castText,
      ageRating,
    };
  }, [data, type]);

  /* -------------------------
     Trailer Key
  ------------------------- */
  const trailerKey = useMemo(() => {
    const vids = data?.videos?.results || [];
    const trailer =
      vids.find((v) => v?.site === "YouTube" && v?.type === "Trailer") ||
      vids.find((v) => v?.site === "YouTube" && v?.type === "Teaser") ||
      vids.find((v) => v?.site === "YouTube");
    return trailer?.key || "";
  }, [data]);

  /* -------------------------
     Cast list
  ------------------------- */
  const castList = useMemo(() => (data?.credits?.cast || []).slice(0, 10), [data]);

  /* -------------------------
     Row queries (✅ useMemo 고정)
  ------------------------- */
  const relatedQuery = useMemo(
    () => ({ path: `${type}/${movieId}/recommendations`, language: "ko-KR" }),
    [type, movieId]
  );

  const topQuery = useMemo(
    () => ({ path: requests.fetchTop10KR, language: "ko-KR" }),
    []
  );

  const handleBack = () => {
    if (from) return navigate(from, { replace: true });
    navigate(-1);
  };

  return (
    <>
      <Helmet>
        <title>
          {titleText} | {siteName}
        </title>
        <meta name="description" content={overviewText} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:site_name" content={siteName} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${titleText} | ${siteName}`} />
        <meta property="og:description" content={overviewText} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImageUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${titleText} | ${siteName}`} />
        <meta name="twitter:description" content={overviewText} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <div className="detail">
        {/* =========================
            HERO
        ========================= */}
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
                    <dd>{ui.castText}</dd>
                  </div>
                </dl>
              </div>

              {castList.length > 0 && (
                <div className="detail__castSection">
                  <h3 className="detail__sectionTitle">출연</h3>
                  <div className="detail__castGrid">
                    {castList.map((c) => {
                      const imgUrl = c?.profile_path
                        ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                        : "";

                      return (
                        <button
                          type="button"
                          key={c.id}
                          className="detail__castCard"
                          title={c?.name || ""}
                        >
                          {imgUrl ? (
                            <img src={imgUrl} alt={c?.name || ""} loading="lazy" />
                          ) : (
                            <div className="detail__castFallback" aria-hidden="true" />
                          )}
                          <div className="detail__castName">{c?.name || FALLBACK}</div>
                          {c?.character && (
                            <div className="detail__castRole">{c.character}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =========================
            TRAILER (있을 때만)
        ========================= */}
        {trailerKey && (
          <section className="detail__trailer">
            <div className="detail__sectionInner">
              <h2 className="detail__sectionTitle">Trailer</h2>
              <div className="detail__trailerBox">
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  title="Trailer"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </section>
        )}

        {/* =========================
            ROWS (요구 로직)
            1) 트레일러 없음 -> TopRated만
            2) 트레일러 있음 -> Related 우선
               - Related 0개면 TopRated fallback
        ========================= */}
        <section className="detail__below detail__below--padded">
          {/* 트레일러 없으면 TopRated만 */}
          {!trailerKey && (
            <Row
              title="자주 찾는 콘텐츠"
              id="detail-toprated"
              query={topQuery}
              mode="navigate"
              navType="movie"
              onNavigate={(movie) => {
                navigate(`/detail/movie/${movie.id}`, { replace: true });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}

          {/* 트레일러 있으면 Related 우선, 0개면 fallback */}
          {trailerKey && (
            <>
              {/* related 로딩 전 or count>0이면 related 표시 */}
              {(!relatedLoaded || relatedCount > 0) && (
                <Row
                  title="비슷한 콘텐츠"
                  id={`detail-related-${type}-${movieId}`}
                  query={relatedQuery}
                  mode="navigate"
                  navType={type}
                  onLoaded={(count) => {
                    setRelatedLoaded(true);
                    setRelatedCount(count);
                  }}
                  onNavigate={(movie) => {
                    navigate(`/detail/${type}/${movie.id}`, { replace: true });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              )}

              {/* related 로드 완료 + 0개면 TopRated fallback */}
              {relatedLoaded && relatedCount === 0 && (
                <Row
                  title="자주 찾는 콘텐츠"
                  id="detail-toprated"
                  query={topQuery}
                  mode="navigate"
                  navType="movie"
                  onNavigate={(movie) => {
                    navigate(`/detail/movie/${movie.id}`, { replace: true });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              )}
            </>
          )}
        </section>

        <div className="detail__backWrap">
          <button className="btn btn--primary" onClick={handleBack}>
            뒤로가기
          </button>
        </div>
      </div>
    </>
  );
}