import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from '../../api/axios';
import "./DetailPage.css"

const DetailPage = ({
  backdrop_path,
  title,
  overview,
  name,
  release_date,
  first_air_date,
  vote_average,
  popularity,
  tagline,
  director,
  revenue,
  crew,
  actor,
  genres,
  status,
  character,
  runtime,
  adult,
  keywords,
  cast,
  setModalOpen
}) => {
  let { movieId } = useParams();
  const [movie, setMovie] = useState({});
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(
        `/movie/${movieId}`

      )
      // console.log('response',response);
      setMovie(response.data);
    }
    fetchData();
  }, [movieId])
  
  if(!movie) return null;
console.log({vote_average});
  return (
    <section>
      <img 
        className='modal__poster-img'
        src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
        alt="img"
      />
      <div className='modal__content'>
            <p className='modal__details'>
              <span className='modal__user_perc'>100% for you</span>{" "}
              {movie.release_date ? movie.release_date : movie.first_air_date}
            </p>

            <h2 className='modal__title'> {movie.title ? movie.title : movie.name}</h2>
            <p className='modal__overview'>평점: {movie.vote_average}점</p>
            <p className='modal__overview'>출시: {movie.status}</p>
            <p className='modal__overview'>러닝타임: {movie.runtime}분</p>
            <p className='modal__overview'>#{movie.tagline}</p>
            <p className='modal__overview'>{movie.overview}</p>
          </div>
    </section>
  )
}

export default DetailPage;