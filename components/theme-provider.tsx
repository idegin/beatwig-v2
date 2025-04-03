"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Next13ProgressBar } from 'next13-progressbar';
import {AuthProvider} from "@/context/auth.context";


export function ThemeProvider({
                                  children,
                                  ...props
                              }: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>
        <Next13ProgressBar height="4px" color="var(--primary)" options={{ showSpinner: true }} showOnShallow />
        <AuthProvider>
            {children}
        </AuthProvider>
    </NextThemesProvider>
}
