import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import tmdbAxios from "../../api/tmdbaxios";
import "./DetailPage.css";

const FALLBACK = "정보 없음";

const pick = (...vals) =>
  vals.find(
    (v) => v !== undefined && v !== null && String(v).trim() !== ""
  );

const DetailPage = () => {
  const { type, movieId } = useParams(); // type: movie | tv
  const [data, setData] = useState(null);
  const [vignette, setVignette] = useState(0); // 0~1

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await tmdbAxios.get("", {
          params: {
            path: `${type}/${movieId}`,
            language: "ko-KR",
            append_to_response:
              "credits,videos,recommendations,similar,keywords,release_dates,content_ratings",
          },
        });

        if (!alive) return;
        setData(res.data);
      } catch (e) {
        console.log("detail fetch error:", e);
        if (!alive) return;
        setData(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [type, movieId]);

  // 스크롤 비네팅(간단 버전): 스크롤 내려갈수록 어두운 오버레이 진해짐
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const next = Math.min(1, y / 200); // 600px 동안 서서히 진해짐
      setVignette(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ui = useMemo(() => {
    if (!data) return null;

    const title =
      pick(data.title, data.name, data.original_title, data.original_name) ??
      FALLBACK;

    const releaseDate = pick(data.release_date, data.first_air_date) ?? "";
    const year = releaseDate ? releaseDate.slice(0, 4) : FALLBACK;

    const overview = pick(data.overview) ?? FALLBACK;

    const genresText =
      Array.isArray(data.genres) && data.genres.length
        ? data.genres.map((g) => g?.name).filter(Boolean).join(", ")
        : FALLBACK;

    // runtime / episode_run_time 그냥 “가능하면 보여줌”
    const runtimeMin = (() => {
      const r = data.runtime;
      if (typeof r === "number" && r > 0) return `${r}분`;

      const er = data.episode_run_time;
      if (
        Array.isArray(er) &&
        er.length &&
        typeof er[0] === "number" &&
        er[0] > 0
      )
        return `회당 ${er[0]}분`;

      return FALLBACK;
    })();

    // 감독: crew에서 Director
    const director = Array.isArray(data?.credits?.crew)
      ? data.credits.crew.find((c) => c?.job === "Director")?.name ?? FALLBACK
      : FALLBACK;

    // 출연: cast 상위 N명
    const cast =
      Array.isArray(data?.credits?.cast) && data.credits.cast.length
        ? data.credits.cast
            .slice(0, 6)
            .map((c) => c?.name)
            .filter(Boolean)
            .join(", ")
        : FALLBACK;

    // 등급: movie=release_dates, tv=content_ratings (없으면 정보 없음)
    const ageRating = (() => {
      if (type === "movie") {
        const kr = data?.release_dates?.results?.find(
          (r) => r?.iso_3166_1 === "KR"
        );
        const cert = kr?.release_dates?.find((x) =>
          (x?.certification || "").trim()
        )?.certification;
        return cert && cert.trim() ? cert : FALLBACK;
      }
      const kr = data?.content_ratings?.results?.find(
        (r) => r?.iso_3166_1 === "KR"
      );
      const rating = kr?.rating;
      return rating && String(rating).trim() ? rating : FALLBACK;
    })();

    // 배경: backdrop 우선, 없으면 poster
    const heroPath = pick(data.backdrop_path, data.poster_path) ?? "";
    const heroUrl = heroPath
      ? `https://image.tmdb.org/t/p/original/${heroPath}`
      : "";

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
      heroUrl,
    };
  }, [data, type]);

  if (!ui) return null;

return (
  <div className="detail">
    {/* 1스크린 HERO */}
    <section
      className="detail__hero"
      style={{ backgroundImage: ui.heroUrl ? `url(${ui.heroUrl})` : "none" }}
    >
      {/* 스크롤 비네팅 오버레이 */}
      <div
        className="detail__vignette"
        style={{ opacity: 0.55 + vignette * 0.65 }}
      />  

      <div className="detail__heroInner">
        {/* LEFT COLUMN */}
        <div className="detail__left">
          {/* 상단 마이크로 라인 */}
          <div className="detail__micro">
            <span className="detail__microStrong">100% for you</span>
            <span className="detail__microDot">•</span>
            <span className="detail__microText">{ui.releaseDate}</span>
          </div>

          <h1 className="detail__title">{ui.title}</h1>

          {/* 뱃지 + 메타 */}
          <div className="detail__metaRow">
            <span
              className={`pill ${
                ui.ageRating === FALLBACK ? "pill--muted" : "pill--age"
              }`}
            >
              {ui.ageRating}
            </span>

            <span className="pill pill--muted">IMAX</span>
            <span className="pill pill--muted">ENHANCED</span>
            <span className="pill pill--muted">AD</span>
            <span className="pill pill--muted">CC</span>

            <span className="metaText">{ui.year}</span>
            <span className="dot" />
            <span className="metaText">{ui.runtimeMin}</span>
            <span className="dot" />
            <span className="metaText">{ui.genresText}</span>
          </div>

          {/* CTA */}
          <div className="detail__actions">
            <button className="btn btn--primary" type="button">
              디즈니+ 가입
            </button>
          </div>

          <p className="detail__overview">{ui.overview}</p>
        </div>

        {/* ✅ WIDE SECTION: heroInner 전체폭 먹고, 그 안에서 3분할 */}
        <div className="detail__wideSection">
          <div className="detail__divider" />
          <div className="detail__sectionLabel">상세 정보</div>

          <div className="detail__infoGrid3 detail__infoGrid3--clean">
            {/* 좌: 타이틀 + 설명 */}
            <div className="detail__infoCol detail__infoCol--main">
              <h2 className="detail__infoTitle">{ui.title}</h2>
              <p className="detail__infoBody">{ui.overview}</p>
            </div>

            {/* 중: 메타 */}
            <dl className="detail__facts detail__facts--stack">
              <div className="fact">
                <dt>러닝 타임:</dt>
                <dd>{ui.runtimeMin}</dd>
              </div>
              <div className="fact">
                <dt>공개일:</dt>
                <dd>{ui.year}</dd>
              </div>
              <div className="fact">
                <dt>장르:</dt>
                <dd>{ui.genresText}</dd>
              </div>
              <div className="fact">
                <dt>관람 등급:</dt>
                <dd>{ui.ageRating}</dd>
              </div>
            </dl>

            {/* 우: 메타 */}
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

        {/* 오른쪽은 공홈처럼 이미지가 보이는 영역이라 그냥 비워둠 */}
        {/* <div className="detail__right" /> */}
      </div>
    </section>

    {/* 아래 스크롤 영역(나중에 Row 붙일 자리) */}
    <section className="detail__below">
      {/* TODO: recommendations/similar 로 Row 만들기 */}
    </section>
  </div>
);

};

export default DetailPage;
