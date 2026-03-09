import React from "react";
import { Helmet } from "react-helmet-async";
import NotFoundView from "../components/Common/NotFoundView";

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 | Disney+ Renewal</title>
        <meta
          name="description"
          content="요청한 페이지를 찾을 수 없습니다."
        />
      </Helmet>

      <NotFoundView />
    </>
  );
}