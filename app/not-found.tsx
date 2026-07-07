import TransitionLink from "@/components/transitions/TransitionLink";

export default function NotFound() {
  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display-2 mt-5 text-5xl">Page not found</h1>
      <p className="lede mt-5 max-w-md">
        The page you&rsquo;re looking for has moved or never existed.
      </p>
      <TransitionLink href="/" className="btn-primary mt-9">
        Back to home
      </TransitionLink>
    </div>
  );
}
