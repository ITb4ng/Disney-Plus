import React from "react";

const BannerLoadingView = ({ bannerRef }) => {
  return (
    <header ref={bannerRef} className="banner banner--skeleton">
      <div className="banner__contents">
        <div className="sk sk-title" />
        <div className="banner__buttons">
          <div className="sk sk-btn" />
        </div>
        <div className="sk sk-desc" />
        <div className="sk sk-desc short" />
      </div>
      <div className="banner--fadeBottom" />
    </header>
  );
};

export default BannerLoadingView;