import React from "react";

const BannerEmptyView = ({ bannerRef, title, description }) => {
  return (
    <header ref={bannerRef} className="banner banner--state">
      <div className="banner__contents">
        <h1 className="banner__title">{title}</h1>
        {description && <p className="banner__stateText">{description}</p>}
      </div>
      <div className="banner--fadeBottom" />
    </header>
  );
};

export default BannerEmptyView;