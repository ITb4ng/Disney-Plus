import React from 'react'
import { styled } from 'styled-components'

const category = () => {
  return (
    <Container>
      <Wrap>
        <img src="/images/viewers-disney.png" alt="disney" />
        <video autoPlay loop muted>
          <source src="/videos/disney.mp4" type='video/mp4' />
        </video>
      </Wrap>
      <Wrap>
        <img src="/images/viewers-marvel.png" alt="marvel" />
        <video autoPlay loop muted>
          <source src="/videos/marvel.mp4" type='video/mp4' />
        </video>
      </Wrap>
      <Wrap>
        <img src="/images/viewers-pixar.png" alt="pixar" />
        <video autoPlay loop muted>
          <source src="/videos/pixar.mp4" type='video/mp4' />
        </video>
      </Wrap>
      <Wrap>
        <img src="/images/viewers-starwars.png" alt="starwars" />
        <video autoPlay loop muted>
          <source src="/videos/star-wars.mp4" type='video/mp4' />
        </video>
      </Wrap>
      <Wrap>
        <img src="/images/viewers-national.png" alt="national" />
        <video autoPlay loop muted>
          <source src="/videos/national-geographic.mp4" type='video/mp4' />
        </video>
      </Wrap>
      <Wrap>
        <img data-brand="hulu" src="https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/ABD0973AB7BC9CD31EEBA7B9A1DDF29F4F176DFDECACBF1BCDB123F2D5957F9C/compose?aspectRatio=1.78&format=webp&width=600" alt="Hulu" />
        <video autoPlay loop muted>
          <source src="https://vod-bgc-oc-east-1.media.dssott.com/bgui/ps01/disney/bgui/2025/11/20/1763651704-xyz.mp4" type='video/mp4' />
        </video>
      </Wrap>
    </Container>
  )
}

export default category;

const Container = styled.div`
  margin-top: 30px;
  padding: 30px 0px 26px;
  display: grid;
  gap: 25px;
  grid-template-columns: repeat(6, 1fr);

  @media (max-width: 768px) {
    grid-template-columns : repeat(2, 1fr);
    gap: 7px;
  }
`;

const Wrap = styled.div`
  padding-top: 56.25%;
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  border: 3px solid rgba(249, 249, 249, 0.1);
  transition: all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s;


  img {
    inset: 0px;
    display: block;
    height: 100%;
    object-fit: contain;
    opacity: 1;
    position: absolute;
    transition: opacity 500ms ease-in-out 0s;
    width: 100%;
    z-index: 1;
  }
  img[data-brand="hulu"] {
    transform: translateY(10px) scale(0.75);
  }
  @media (max-width: 1024px) {
   img[data-brand="hulu"] {
    transform: translateY(6px) scale(0.75);
  }
  }  
  @media (max-width: 768px) {
    img[data-brand="hulu"] {
    transform: translateY(12px) scale(0.75);
  }
  }
  video {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    opacity: 0;
    z-index: 0;
  }

  &:hover {
    box-shadow: rgb(0 0 0 /80%) 0px 40px 58px -16px,
                rgb(0 0 0 /72%) 0px 30px 22px -10px;
    transform: scale(1.05);
    border-color: rgba(249, 249, 249, 0.8);
    video {
      opacity: 1;
    }

  }
`;