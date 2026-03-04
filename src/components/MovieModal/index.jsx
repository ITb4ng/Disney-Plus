import React, { useEffect, useCallback } from "react";
import styled from "styled-components";

const MovieModal = ({
  title,
  name,
  overview,
  backdrop_path,
  poster_path,
  vote_average,
  setModalOpen,
}) => {
  const displayTitle = title || name || "Untitled";
  const imgPath = backdrop_path || poster_path;

  const close = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    
    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);

      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;

      window.scrollTo(0, scrollY);
    };
  }, [close]);

  return (
    <Overlay
      role="dialog"
      aria-modal="true"
      aria-label="Movie details modal"
      onMouseDown={close} 
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      <Modal
        onMouseDown={(e) => e.stopPropagation()} 
      >
        <CloseButton type="button" aria-label="Close modal" onClick={close}>
          ✕
        </CloseButton>

        {imgPath && (
          <Hero>
            <HeroImg
              src={`https://image.tmdb.org/t/p/original${imgPath}`}
              alt={displayTitle}
              loading="lazy"
            />
            <HeroShade />
          </Hero>
        )}

        <Content>
          <Meta>100% for you • {new Date().toISOString().slice(0, 10)}</Meta>
          <Title>{displayTitle}</Title>
          <Score>평점: {typeof vote_average === "number" ? vote_average.toFixed(3) : "N/A"}</Score>
          <Overview>{overview || "설명이 없습니다."}</Overview>
        </Content>
      </Modal>
    </Overlay>
  );
};

export default MovieModal;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: grid;
  place-items: center;

  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(2px);
  overscroll-behavior: none;
`;

const Modal = styled.div`
  position: relative;
  width: min(920px, calc(100vw - 48px));
  max-height: calc(100vh - 48px);

  background: rgba(15, 17, 20, 0.98);
  border-radius: 14px;
  overflow: hidden;

  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.65);
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;

  width: 40px;
  height: 40px;
  border-radius: 999px;

  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.95);

  cursor: pointer;
  font-size: 18px;
  line-height: 1;

  display: grid;
  place-items: center;

  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;

  &:hover {
    transform: scale(1.04);
    background: rgba(0, 0, 0, 0.55);
    border-color: rgba(255, 255, 255, 0.35);
  }
`;

const Hero = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #111;
`;

const HeroImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const HeroShade = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.75) 100%);
`;

const Content = styled.div`
  padding: 22px 24px 26px;
  overflow: auto; 
`;

const Meta = styled.div`
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  margin-bottom: 10px;
`;

const Title = styled.h1`
  margin: 0 0 12px;
  font-size: 44px;
  line-height: 1.05;
`;

const Score = styled.div`
  margin: 0 0 14px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.86);
`;

const Overview = styled.p`
  margin: 0;
  font-size: 18px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.86);
`;
