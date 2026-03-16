import React from "react";
import Row from "../../../components/Row";
import requests from "../../../../api/request";

export default function Top10Row({
  userData,
  debugState,
  onSwiperReady,
  onNavStateChange,
}) {
  return (
    <Row
      id="TOP10"
      fetchUrl={requests.fetchTop10KR}
      variant="top10"
      showRank
      useExternalNav
      limit={10}
      userData={userData}
      onSwiperReady={onSwiperReady}
      onNavStateChange={onNavStateChange}
      debugState={debugState}
    />
  );
}