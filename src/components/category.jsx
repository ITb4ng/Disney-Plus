import React from "react";
import "./category.css";

const brands = [
  {
    name: "disney",
    logo: "/images/viewers-disney.png",
    video: "/videos/disney.mp4",
  },
  {
    name: "marvel",
    logo: "/images/viewers-marvel.png",
    video: "/videos/marvel.mp4",
  },
  {
    name: "pixar",
    logo: "/images/viewers-pixar.png",
    video: "/videos/pixar.mp4",
  },
  {
    name: "starwars",
    logo: "/images/viewers-starwars.png",
    video: "/videos/star-wars.mp4",
  },
  {
    name: "national",
    logo: "/images/viewers-national.png",
    video: "/videos/national-geographic.mp4",
  },
  {
    name: "hulu",
    logo:
      "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/ABD0973AB7BC9CD31EEBA7B9A1DDF29F4F176DFDECACBF1BCDB123F2D5957F9C/compose?aspectRatio=1.78&format=webp&width=600",
    video:
      "https://vod-bgc-oc-east-1.media.dssott.com/bgui/ps01/disney/bgui/2025/11/20/1763651704-xyz.mp4",
  },
];

const category = () => {
  return (
    <div className="category">
      {brands.map((brand) => (
        <div key={brand.name} className="category-card">
          <img
            src={brand.logo}
            alt={brand.name}
            className="category-logo"
            data-brand={brand.name}
          />
          <video autoPlay loop muted playsInline>
            <source src={brand.video} type="video/mp4" />
          </video>
        </div>
      ))}
    </div>
  );
};

export default category;
