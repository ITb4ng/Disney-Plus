import axios from "../../../../api/axios";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import "swiper/css";
import styled from "styled-components";

const IMG_BASE = "https://image.tmdb.org/t/p/original";

const Top10Row = ({
  id,
  fetchParams,
  limit = 10,
  onSwiperReady,
  onNavStateChange,
  disableNav = true, // ✅ 기본값: Top10은 네비 숨기는 쪽이 자연스러움
}) => {
  const [movies, setMovies] = useState([]);
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!fetchParams?.path) return;

      const response = await axios.get("", {
        params: fetchParams,
      });

      const results = response?.data?.results ?? [];
      setMovies(results.slice(0, limit));
    };

    fetchMovieData();
  }, [fetchParams, limit]);

  const reportNavState = (s) => {
    if (disableNav) return;
    onNavStateChange?.({ isBeginning: s.isBeginning, isEnd: s.isEnd });
  };

  useEffect(() => {
    if (disableNav) return;

    const s = swiperRef.current;
    if (!s) return;

    requestAnimationFrame(() => {
      s.update();
      onNavStateChange?.({ isBeginning: s.isBeginning, isEnd: s.isEnd });
    });
  }, [movies, onNavStateChange, disableNav]);

  const getImg = (m) => m?.backdrop_path || m?.poster_path || "";
  const getTitle = (m) =>
    m?.title || m?.name || m?.original_title || m?.original_name || "movie";

  return (
    <Container id={id} className="top10">
      <Swiper
        modules={[A11y]}
        loop={false}
        spaceBetween={12}
        breakpoints={{
          1378: { slidesPerView: 5.4, slidesPerGroup: 5 },
          998:  { slidesPerView: 4.4, slidesPerGroup: 4 },
          625:  { slidesPerView: 3.4, slidesPerGroup: 3 },

          390:  { slidesPerView: 2.05, slidesPerGroup: 2, spaceBetween: 14 },
          0:    { slidesPerView: 1.85, slidesPerGroup: 1, spaceBetween: 12 },
        }}
        onSwiper={(s) => {
          swiperRef.current = s;

          // ✅ Top10에선 기본적으로 네비 안 쓰기
          if (!disableNav) {
            onSwiperReady?.(s);
            reportNavState(s);
          }
        }}
        onInit={disableNav ? undefined : reportNavState}
        onSlideChange={disableNav ? undefined : reportNavState}
        onResize={disableNav ? undefined : reportNavState}
      >
        {movies
          .filter((m) => !!getImg(m))
          .map((movie, index) => {
            const path = getImg(movie);
            const title = getTitle(movie);

            return (
              <SwiperSlide key={movie.id}>
                <Card>
                <span className="rank--outline rank--bl" aria-hidden="true">
                  {index + 1}
                </span>
                  <img
                    src={`${IMG_BASE}${path}`}
                    alt={title}
                    loading="lazy"
                    onError={(e) => {
                      // ✅ 혹시라도 깨지면 이미지 숨김 (카드 레이아웃은 유지)
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </Card>
              </SwiperSlide>
            );
          })}
      </Swiper>
    </Container>
  );
};

export default Top10Row;

const Container = styled.div`
  position: relative;
  height: 100%;
`;

const Card = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box; 
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  border: 3px solid rgba(249, 249, 249, 0.1);

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
