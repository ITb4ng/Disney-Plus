import axios from 'axios'

const instance = axios.create({
    baseURL: "https://api.themoviedb.org/3",
    params: {
        api_key : "46d0ff91847469289f9d2b5f3286e045",
        language : "ko-KR"
    }
})

export default instance;