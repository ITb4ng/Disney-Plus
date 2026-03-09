import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFoundView.css";

export default function NotFoundView({
  title = "페이지를 찾을 수 없습니다",
  description = "요청한 주소가 없거나 이동되었을 수 있습니다.",
  showBack = true,
  homeLabel = "메인으로 이동",
  backLabel = "뒤로가기",
}) {
  const navigate = useNavigate();

  return (
    <section className="notfound">
      <div className="notfound__inner">
        <p className="notfound__eyebrow">404 NOT FOUND</p>
        <h1 className="notfound__title">{title}</h1>
        <p className="notfound__desc">{description}</p>

        <div className="notfound__actions">
          <button
            type="button"
            className="notfound__btn notfound__btn--primary"
            onClick={() => navigate("/main", { replace: true })}
          >
            {homeLabel}
          </button>

          {showBack && (
            <button
              type="button"
              className="notfound__btn notfound__btn--ghost"
              onClick={() => navigate(-1)}
            >
              {backLabel}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}