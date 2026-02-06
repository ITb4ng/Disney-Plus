import axios from "../../../../api/axios";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import "swiper/css";
import styled from "styled-components";

const IMG_BASE = "https://image.tmdb.org/t/p/original";

const Top10Row = ({ id, fetchParams, limit = 10, onSwiperReady, onNavStateChange,}) => {
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


  useEffect(() => {
    const s = swiperRef.current;
    if (!s) return;

    requestAnimationFrame(() => {
      s.update();
      onNavStateChange?.({ isBeginning: s.isBeginning, isEnd: s.isEnd });
    });
  }, [movies, onNavStateChange]);

  const reportNavState = (s) => {
    onNavStateChange?.({ isBeginning: s.isBeginning, isEnd: s.isEnd });
  };

  const getImg = (m) => m?.backdrop_path || m?.poster_path || "";
  const getTitle = (m) => m?.title || m?.name || m?.original_title || m?.original_name || "movie";

  return (
    <Container id={id}>
      <Swiper
        modules={[A11y]}
        loop={false}
        spaceBetween={18}
        breakpoints={{
          1378: { slidesPerView: 5.4, slidesPerGroup: 5 },
          998: { slidesPerView: 4.4, slidesPerGroup: 4 },
          625: { slidesPerView: 3.4, slidesPerGroup: 3 },
          0: { slidesPerView: 2.2, slidesPerGroup: 2 },
        }}
        onSwiper={(s) => {
          swiperRef.current = s;
          onSwiperReady?.(s);
          reportNavState(s);
        }}
        onInit={reportNavState}
        onSlideChange={reportNavState}
        onResize={reportNavState}
      >
        {movies
          .filter((m) => !!getImg(m)) // ✅ 이미지 없는 놈은 제외
          .map((movie) => {
            const path = getImg(movie);
            const title = getTitle(movie);

            return (
              <SwiperSlide key={movie.id}>
                <Card>
                  <img
                    src={`${IMG_BASE}${path}`}
                    alt={title}
                    loading="lazy"
                    onError={(e) => {
                      // ✅ 혹시라도 깨지면 카드 숨김 (디자인 지키기)
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
`;

const Card = styled.div`
  width: 95%;
  padding-top: 56.25%;
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
