"use client"

import Link from "next/link"
import { Network } from "@/types/tmdb.types"
import { TMDB_IMAGE_BASE } from "@/app/constants"

interface NetworkCardProps {
  network: Network
}


export function NetworkCard({ network }: NetworkCardProps) {
  const logoUrl = network.logo_path
    ? `${TMDB_IMAGE_BASE}/w300${network.logo_path}`
    : null

  return (
    <Link href={`/networks/${network.id}`} className="group block">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted" />
        
        {network.image && (
          <img
            src={network.image}
            alt={network.name}
            className="w-full h-full object-cover opacity-30 transition-transform duration-500 group-hover:scale-110"
          />
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-3">
          {logoUrl ? (
            <div className="bg-white rounded-lg p-3 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <img
                src={logoUrl}
                alt={network.name}
                className="h-8 md:h-10 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="bg-primary rounded-lg px-4 py-2 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <span className="text-lg font-bold text-primary-foreground">
                {network.name.charAt(0)}
              </span>
            </div>
          )}
          
          <h3 className="font-semibold text-foreground text-center text-sm md:text-base transition-colors group-hover:text-primary">
            {network.name}
          </h3>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </Link>
  )
}
