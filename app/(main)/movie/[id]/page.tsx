import {SiteHeader} from "@/components/site-header"
import {MediaDetails} from "@/components/media-details/media-details"
import {getMovieDetails} from "@/lib/tmdb"
import type {Metadata} from "next"
import {MovieTorrent} from "@/lib/yts";

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const { id } = await params
    const movieDetails = await getMovieDetails(id)

    return {
        title: `${movieDetails.title} | BeatWig`,
        description: movieDetails.overview,
        openGraph: {
            images: [
                {
                    url: `https://image.tmdb.org/t/p/w1280${movieDetails.backdrop_path}`,
                    width: 1280,
                    height: 720,
                    alt: movieDetails.title,
                },
            ],
        },
    }
}

export default async function MoviePage({params}: Props) {
    const { id } = await params
    const movieDetails = await getMovieDetails(id);
    const imdb_id = movieDetails.imdb_id;
    let movieTorrents: MovieTorrent[] = [];

    try {
        const res = await fetch(`https://yts.mx/api/v2/movie_details.json?imdb_id=${imdb_id}`, {
            next: { revalidate: 3600 }
        })
        if (res.ok) {
            const data = await res.json()
            movieTorrents = data.data?.movie?.id === 0 ? [] : data.data?.movie?.torrents || [];
        }
    } catch (error) {
        console.error('Error fetching torrents:', error)
    }

    return (
        <>
            <SiteHeader/>
            <MediaDetails
                torrents={movieTorrents}
                data={movieDetails}
                type="movie"
            />
        </>
    )
}
