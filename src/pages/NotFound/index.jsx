import React, { useLayoutEffect } from "react";
import { Helmet } from "react-helmet-async";
import NotFoundView from "./components/NotFoundView";
import { setAppScrollY } from "../../utils/scrollPosition";

export default function NotFoundPage() {
  useLayoutEffect(() => {
    setAppScrollY(0);
  }, []);

  return (
    <>
      <Helmet>
        <title>404 | Disney+ Renewal</title>
        <meta name="description" content="요청하신 페이지를 찾을 수 없습니다." />
      </Helmet>

      <NotFoundView />
    </>
  );
}
