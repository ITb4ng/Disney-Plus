import axios from "../../../../api/axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import "swiper/css";
import styled from "styled-components";

const Top10Row = ({ id, fetchUrl, limit = 10, onSwiperReady, onNavStateChange }) => {
  const [movies, setMovies] = useState([]);
  const swiperRef = useRef(null);

  const fetchMovieData = useCallback(async () => {
    const response = await axios.get(fetchUrl);
    const results = response?.data?.results ?? [];
    setMovies(results.slice(0, limit));
  }, [fetchUrl, limit]);

  useEffect(() => {
    fetchMovieData();
  }, [fetchMovieData]);

  // ✅ movies가 바뀐 뒤 swiper 상태를 강제로 업데이트 + nav 상태 재계산
  useEffect(() => {
    const s = swiperRef.current;
    if (!s) return;

    // 슬라이드 DOM 반영 후 업데이트
    requestAnimationFrame(() => {
      s.update();
      onNavStateChange?.({ isBeginning: s.isBeginning, isEnd: s.isEnd });
    });
  }, [movies, onNavStateChange]);

  const reportNavState = (s) => {
    onNavStateChange?.({ isBeginning: s.isBeginning, isEnd: s.isEnd });
  };

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
          reportNavState(s); // ✅ 초기 상태 반영
        }}
        onInit={(s) => reportNavState(s)}         // ✅ init 때 한 번 더
        onSlideChange={(s) => reportNavState(s)}  // ✅ 슬라이드 이동 시 갱신
        onResize={(s) => reportNavState(s)}       // ✅ 브레이크포인트/리사이즈 대응
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <Card>
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                alt={movie.title || movie.name || "movie"}
                loading="lazy"
              />
            </Card>
          </SwiperSlide>
        ))}
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
