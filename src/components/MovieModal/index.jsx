import React, { useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getAppScrollY, setAppScrollY } from "../../utils/scrollPosition";

const MovieModal = ({
  title,
  name,
  overview,
  backdrop_path,
  poster_path,
  vote_average,
  media_type,
  id,
  setModalOpen,
  isLoggedIn = false,
  sourcePath = "/",
  sourceTag = "top10",
  debugState,
}) => {
  const navigate = useNavigate();
  const openedScrollYRef = useRef(0);
  const shouldRestoreOnUnmountRef = useRef(true);
  const displayTitle = title || name || "Untitled";
  const imgPath = backdrop_path || poster_path;
  const detailType = media_type || "movie";
  const detailId = id;

  const close = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  const handleContentAction = useCallback(() => {
    const savedScrollY = openedScrollYRef.current;
    shouldRestoreOnUnmountRef.current = false;
    close();

    // 로그인 전이면 로그인 페이지로 이동하면서
    // 클릭한 콘텐츠 정보를 state로 함께 전달
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: sourcePath,
          intent: "detail",
          teaserSource: sourceTag,
          detailId: detailId ?? null,
          detailType,
          detailTitle: displayTitle,
          detailBackdrop: backdrop_path ?? null,
          detailPoster: poster_path ?? null,
          scrollY: savedScrollY,
          detailDebugState: debugState,
        },
      });
      return;
    }

    // 로그인 후라면 바로 detail 이동
    if (detailId) {
      navigate(`/detail/${detailType}/${detailId}`, {
        state: {
          from: sourcePath,
          teaserSource: sourceTag,
          preloadedTitle: displayTitle,
          scrollY: savedScrollY,
          preloadedBackdrop: backdrop_path ?? null,
          preloadedPoster: poster_path ?? null,
          detailDebugState: debugState,
        },
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [
    close,
    isLoggedIn,
    navigate,
    detailId,
    detailType,
    displayTitle,
    backdrop_path,
    poster_path,
    sourcePath,
    sourceTag,
    debugState,
  ]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };

    const lockWindowY = window.scrollY || 0;
    const appScrollY = getAppScrollY();
    openedScrollYRef.current = appScrollY;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockWindowY}px`;
    document.body.style.width = "100%";

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);

      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;

      if (shouldRestoreOnUnmountRef.current) {
        setAppScrollY(appScrollY);
      }
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
      <Modal onMouseDown={(e) => e.stopPropagation()}>
        <CloseButton
          type="button"
          aria-label="Close modal"
          data-testid="modal-close"
          onClick={close}
        >
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
          <Score>
            평점:{" "}
            {typeof vote_average === "number" ? vote_average.toFixed(1) : "N/A"}
          </Score>
          <Overview>{overview || "설명이 없습니다."}</Overview>

          <ActionRow>
            <PrimaryButton
              type="button"
              data-testid="modal-go-detail"
              onClick={handleContentAction}
            >
              콘텐츠 보러가기
            </PrimaryButton>

            <SecondaryButton
              type="button"
              data-testid="modal-cancel"
              onClick={close}
            >
              닫기
            </SecondaryButton>
          </ActionRow>
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

  @media (max-width: 768px) {
    place-items: end center;
    padding: 0 0 env(safe-area-inset-bottom);
  }
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

  @media (max-width: 768px) {
    width: min(100vw, 100vw);
    max-height: min(88vh, 88svh);
    border-radius: 16px 16px 0 0;
  }

  @media (max-width: 480px) {
    max-height: min(86vh, 86svh);
  }
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

  @media (max-width: 480px) {
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
`;

const Hero = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #111;

  @media (max-width: 480px) {
    aspect-ratio: 16 / 11;
  }
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
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 30%,
    rgba(0, 0, 0, 0.75) 100%
  );
`;

const Content = styled.div`
  padding: 22px 24px 26px;
  overflow: hidden;
  display: grid;
  gap: 0;

  @media (max-width: 768px) {
    padding: 14px 14px 16px;
  }

  @media (max-width: 390px) {
    padding: 12px 10px calc(10px + env(safe-area-inset-bottom));
  }
`;

const Meta = styled.div`
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 480px) {
    font-size: 11px;
    margin-bottom: 6px;
  }
`;

const Title = styled.h1`
  margin: 0 0 12px;
  font-size: 44px;
  line-height: 1.05;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  @media (max-width: 768px) {
    font-size: clamp(26px, 9vw, 34px);
    margin-bottom: 8px;
  }

  @media (max-width: 360px) {
    font-size: 22px;
  }
`;

const Score = styled.div`
  margin: 0 0 14px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.86);

  @media (max-width: 480px) {
    margin-bottom: 8px;
    font-size: 13px;
  }
`;

const Overview = styled.p`
  margin: 0 0 22px;
  font-size: 18px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.86);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;

  @media (max-width: 768px) {
    font-size: 15px;
    line-height: 1.45;
    margin-bottom: 12px;
    -webkit-line-clamp: 5;
  }

  @media (max-width: 390px) {
    font-size: 13px;
    line-height: 1.4;
    -webkit-line-clamp: 4;
  }

  @media (max-width: 360px) {
    -webkit-line-clamp: 3;
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const PrimaryButton = styled.button`
  min-height: 48px;
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;

  color: #081018;
  background: #f5f5f5;

  transition: transform 120ms ease, opacity 120ms ease, box-shadow 120ms ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.96;
    box-shadow: 0 8px 20px rgba(255, 255, 255, 0.08);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    width: 100%;
    min-height: 44px;
    font-size: 14px;
  }
`;

const SecondaryButton = styled.button`
  min-height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  padding: 12px 18px;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;

  color: rgba(255, 255, 255, 0.94);
  background: rgba(255, 255, 255, 0.06);

  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.34);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    width: 100%;
    min-height: 44px;
    font-size: 14px;
  }
`;
