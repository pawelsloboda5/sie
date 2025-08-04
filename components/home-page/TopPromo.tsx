'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export function TopPromo() {
return (
<div className="w-full border-b bg-white/70 dark:bg-gray-950/70 backdrop-blur">
<div className="container py-2 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs md:text-sm text-gray-700 dark:text-gray-300">
<div className="inline-flex items-center gap-2">
<Sparkles className="h-4 w-4 text-teal-600" />
<span className="font-medium">New:</span>
<span>Faster provider matching with accessibility & language filters</span>
</div>
<Link href="/app" className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400 hover:underline" >
Try it <ArrowRight className="h-3.5 w-3.5" />
</Link>
</div>
</div>
);
}