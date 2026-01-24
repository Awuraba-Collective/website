"use client";

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export function RouteLoader() {
    return (
        <ProgressBar
            height="4px"
            color="#ffffff"
            options={{ showSpinner: false }}
            shallowRouting
        />
    );
}
