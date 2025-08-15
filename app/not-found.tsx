import Link from 'next/link'

export default function NotFound() {
	return (
		<main className="container py-16">
			<h1 className="text-display-lg mb-4">Page not found</h1>
			<p className="text-body-base text-muted-foreground mb-6">
				Sorry, we couldn’t find the page you’re looking for.
			</p>
			<Link className="underline" href="/">Go back home</Link>
		</main>
	)
}


