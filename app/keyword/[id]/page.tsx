"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { Film } from "@/types/tmdb.types"
import { KeywordHero } from "./components/keyword-hero"
import { KeywordGrid } from "./components/keyword-grid"

interface Keyword {
    id: number
    name: string
}

export default function KeywordDetailsPage() {
    const params = useParams()
    const keywordId = parseInt(params.id as string)
    const [keyword, setKeyword] = useState<Keyword | null>(null)
    const [films, setFilms] = useState<Film[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [totalResults, setTotalResults] = useState(0)
    const observerRef = useRef<HTMLDivElement>(null)

    const fetchFilms = useCallback(async (pageNum: number, isNewFetch: boolean = false) => {
        if (isNewFetch) {
            setLoading(true)
        } else {
            setLoadingMore(true)
        }

        try {
            const res = await fetch(
                `/api/public/keyword?keywordId=${keywordId}&page=${pageNum}`
            )
            const data = await res.json()

            if (data.keyword) {
                setKeyword(data.keyword)
            }

            if (data.results) {
                if (isNewFetch) {
                    setFilms(data.results)
                } else {
                    setFilms((prev) => [...prev, ...data.results])
                }
                setHasMore(pageNum < data.total_pages)
                setTotalResults(data.total_results || 0)
            }
        } catch (error) {
            console.error("Error fetching keyword films:", error)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [keywordId])

    useEffect(() => {
        setPage(1)
        setFilms([])
        setHasMore(true)
        fetchFilms(1, true)
    }, [keywordId, fetchFilms])

    useEffect(() => {
        if (!hasMore || loadingMore || loading) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    const nextPage = page + 1
                    setPage(nextPage)
                    fetchFilms(nextPage)
                }
            },
            { threshold: 0.1 }
        )

        if (observerRef.current) {
            observer.observe(observerRef.current)
        }

        return () => observer.disconnect()
    }, [hasMore, loadingMore, loading, page, fetchFilms])

    const heroFilm = films[0]

    return (
        <div className="min-h-screen">
            <KeywordHero
                keyword={keyword}
                totalResults={totalResults}
                heroFilm={heroFilm}
                loading={loading}
            />

            <KeywordGrid
                films={films}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                observerRef={observerRef}
            />
        </div>
    )
}
