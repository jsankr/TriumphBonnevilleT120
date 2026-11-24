const paths={
 grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
 layers:'m12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5',
 cube:'m12 2 9 5v10l-9 5-9-5V7z M3 7l9 5 9-5 M12 12v10',
 box:'M3 6h18v4H3z M5 10v10h14V10 M9 14h6',
 bolt:'m14 2-11 12h8l-1 8 11-13h-8z',
 calendar:'M3 6h18v15H3z M7 3v6 M17 3v6 M3 11h18 M7 15h4',
 check:'M4 4h16v16H4z m3 8 3 3 7-7',
 wrench:'M14 6a5 5 0 0 0-6 6L3 17a2.8 2.8 0 0 0 4 4l6-6a6 6 0 0 0 7-8l-4 4-3-3 4-4z',
 disc:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M12 5v1 M19 12h-1 M12 19v-1 M5 12h1',
 book:'M12 6Q7 3 2 5v14q5-2 10 1 5-3 10-1V5q-5-2-10 1z M12 6v14',
 file:'M5 2h9l5 5v15H5z M14 2v6h5 M8 13h8 M8 17h6',
 search:'M16.5 10a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z M15 15l6 6',
 focus:'M3 9V3h6 M15 3h6v6 M21 15v6h-6 M9 21H3v-6 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
 image:'M3 4h18v16H3z m0 12 6-6 4 4 3-3 5 5 M16 8h.1',
 spark:'m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z',
 gauge:'M3 18a10 10 0 1 1 18 0z M12 14l5-5',chart:'M3 3v18h18 M7 16v-3 M12 16V8 M17 16V5',
 paint:'M3 4h14v7H3z M17 7h4v7H11v7', menu:'M3 6h18 M3 12h18 M3 18h18'
};
export function Icon({name,size=22}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>}
