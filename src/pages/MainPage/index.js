import React from 'react'
// import Nav from '../../components/Nav'
import Banner from '../../components/banner'
import Row from '../../components/Row'
import Category from '../../components/category'
import styled  from 'styled-components'
import requests from '../../api/request'
import FooterSection from "../LoginPage/sections/Footer/FooterSection";

const MainPage = () => {
  return (
    <><Container>
      <Banner />
      <Category />
      <Row title="Top Rated" id="TR" fetchUrl={requests.fetchTopRated} showRank />
      <Row title="Trending Now" id="TN" fetchUrl={requests.fetchTrending} />
      <Row title="Action Movies" id="AM" fetchUrl={requests.fetchActionMovies} />
      <Row title="Comedy Movies" id="CM" fetchUrl={requests.fetchComedyMovies} />
    </Container><FooterSection /></>
  )
}

export default MainPage

const Container = styled.main`
  position: relative;
  min-height: calc(100vh - 250px);
  overflow-x: hidden;
  display: block;
  padding: 72px calc(3.5vw + 5px) 0;
`;
