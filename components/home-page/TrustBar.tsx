'use client';

function TrustPill({ children }: { children: React.ReactNode }) {
return (
<div className="rounded-full border px-3 py-1 text-xs text-gray-700 dark:text-gray-300">
{children}
</div>
);
}

export function TrustBar() {
return (
<section className="container py-12 md:py-14">
<div className="rounded-2xl border bg-white dark:bg-gray-900 p-5 md:p-7 shadow-sm">
<div className="flex flex-col md:flex-row items-center justify-between gap-4">
<div className="text-center md:text-left">
<p className="text-sm text-gray-600 dark:text-gray-400">
Backed by open data and built with privacy in mind
</p>
<p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
CMS NPPES + continuous validation + human-in-the-loop reviews
</p>
</div>
<div className="flex flex-wrap items-center gap-3">
<TrustPill>HIPAA-aware flows</TrustPill>
<TrustPill>Language support</TrustPill>
<TrustPill>Accessibility filters</TrustPill>
</div>
</div>
</div>
</section>
);
}