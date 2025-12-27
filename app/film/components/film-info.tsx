"use client"

import { Calendar, Clock, Globe, DollarSign, TrendingUp, Building2, Tv, Film } from "lucide-react"

interface FilmInfoProps {
  releaseDate: string
  runtime?: number
  budget?: number
  revenue?: number
  status: string
  originalLanguage: string
  productionCompanies: { id: number; name: string; logo_path: string | null }[]
  productionCountries: { iso_3166_1: string; name: string }[]
  spokenLanguages: { english_name: string; iso_639_1: string }[]
  numberOfSeasons?: number
  numberOfEpisodes?: number
}

export function FilmInfo({
  releaseDate,
  runtime,
  budget,
  revenue,
  status,
  originalLanguage,
  productionCompanies,
  productionCountries,
  spokenLanguages,
  numberOfSeasons,
  numberOfEpisodes,
}: FilmInfoProps) {
  const formatCurrency = (amount: number) => {
    if (amount === 0) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatRuntime = (minutes?: number) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const isTV = numberOfSeasons !== undefined

  return (
    <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-4 border-b border-border/50">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          {isTV ? <Tv className="size-5 text-primary" /> : <Film className="size-5 text-primary" />}
          {isTV ? "Series Info" : "Movie Details"}
        </h3>
      </div>

      <div className="p-5 space-y-5">
        {numberOfSeasons !== undefined && numberOfEpisodes !== undefined && (
          <div className="grid grid-cols-2 gap-3 pb-5 border-b border-border/30">
            <div className="bg-primary/5 rounded-xl p-4 text-center">
              <span className="text-3xl font-bold text-primary">{numberOfSeasons}</span>
              <p className="text-xs text-muted-foreground mt-1">Seasons</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 text-center">
              <span className="text-3xl font-bold text-primary">{numberOfEpisodes}</span>
              <p className="text-xs text-muted-foreground mt-1">Episodes</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <InfoRow 
            icon={Calendar} 
            label="Release Date" 
            value={releaseDate ? new Date(releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"} 
          />
          <InfoRow icon={Clock} label="Runtime" value={formatRuntime(runtime)} />
          <InfoRow icon={TrendingUp} label="Status" value={status} highlight />
          <InfoRow icon={Globe} label="Language" value={originalLanguage.toUpperCase()} />
          {budget !== undefined && budget > 0 && (
            <InfoRow icon={DollarSign} label="Budget" value={formatCurrency(budget)} />
          )}
          {revenue !== undefined && revenue > 0 && (
            <InfoRow icon={DollarSign} label="Revenue" value={formatCurrency(revenue)} />
          )}
        </div>

        {productionCompanies.length > 0 && (
          <div className="pt-4 border-t border-border/30">
            <h4 className="text-sm font-semibold text-foreground mb-3">Production</h4>
            <div className="space-y-2">
              {productionCompanies.slice(0, 3).map((company) => (
                <div
                  key={company.id}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  {company.logo_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                      alt={company.name}
                      className="h-5 w-auto object-contain filter dark:invert opacity-70"
                    />
                  ) : (
                    <Building2 className="size-4 shrink-0" />
                  )}
                  <span className="truncate">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {productionCountries.length > 0 && (
          <div className="pt-4 border-t border-border/30">
            <h4 className="text-sm font-semibold text-foreground mb-2">Countries</h4>
            <div className="flex flex-wrap gap-1.5">
              {productionCountries.map((country) => (
                <span
                  key={country.iso_3166_1}
                  className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-medium"
                >
                  {country.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {spokenLanguages.length > 0 && (
          <div className="pt-4 border-t border-border/30">
            <h4 className="text-sm font-semibold text-foreground mb-2">Languages</h4>
            <div className="flex flex-wrap gap-1.5">
              {spokenLanguages.map((lang) => (
                <span
                  key={lang.iso_639_1}
                  className="bg-muted text-muted-foreground px-2.5 py-1 rounded-md text-xs font-medium"
                >
                  {lang.english_name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ 
  icon: Icon, 
  label, 
  value,
  highlight = false
}: { 
  icon: React.ElementType
  label: string 
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm font-medium ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  )
}
