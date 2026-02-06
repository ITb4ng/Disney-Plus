import React, { useCallback, useEffect, useRef } from "react";
import useOnClickOutside from "../../hooks/useOnClickOutside.js";
import "./MovieModal.css";

const MovieModal = ({
  backdrop_path,
  title,
  overview,
  name,
  release_date,
  first_air_date,
  vote_average,
  setModalOpen,
}) => {
  const ref = useRef(null);

  // ✅ close 참조 고정 (eslint react-hooks/exhaustive-deps 해결)
  const close = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  // ✅ 바깥 클릭 닫기
  useOnClickOutside(ref, close);

  // ✅ ESC 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  const modalTitle = title || name || "콘텐츠 정보";
  const dateText = release_date || first_air_date || "";
  const imgSrc = backdrop_path ? `https://image.tmdb.org/t/p/original/${backdrop_path}` : "";

  return (
    <div className="presentation" role="presentation">
      <div className="wrapper-modal">
        <div
          className="modal"
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle}
        >
          <button type="button" onClick={close} className="modal-close" aria-label="닫기">
            닫기
          </button>

          {imgSrc && <img className="modal__poster-img" src={imgSrc} alt={modalTitle} />}

          <div className="modal__content">
            <p className="modal__details">
              <span className="modal__user_perc">100% for you</span> {dateText}
            </p>

            <h2 className="modal__title">{modalTitle}</h2>
            <p className="modal__overview">평점: {vote_average ?? "-"}</p>
            <p className="modal__overview">{overview || "설명이 없습니다."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
