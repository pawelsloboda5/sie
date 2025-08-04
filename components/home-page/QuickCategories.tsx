'use client';

import Link from 'next/link';
import { HeartHandshake, Users, Shield, ArrowRight } from 'lucide-react';

export function QuickCategories() {
const items = [
{ title: 'Free & Low-Cost Care', desc: 'Clinics and screenings', icon: <HeartHandshake className="h-5 w-5 text-teal-700" /> },
{ title: 'Accessible Services', desc: 'Language & disability access', icon: <Users className="h-5 w-5 text-teal-700" /> },
{ title: 'Insurance & Payment', desc: 'Sliding scale and coverage', icon: <Shield className="h-5 w-5 text-teal-700" /> },
];

return (
<section className="container -mt-4 md:-mt-10">
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
{items.map((item) => (
<Link key={item.title} href="/app" className="group">
<div className="rounded-xl border bg-white dark:bg-gray-900 p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
<div className="flex items-center gap-3">
<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-900/20">
{item.icon}
</div>
<div className="min-w-0">
<div className="font-semibold truncate">{item.title}</div>
<div className="text-sm text-gray-600 dark:text-gray-400 truncate">
{item.desc}
</div>
</div>
<ArrowRight className="ml-auto h-4 w-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
</div>
</div>
</Link>
))}
</div>
</section>
);
}