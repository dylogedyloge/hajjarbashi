import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';

interface NavigationLink {
  href: string;
  label: string;
}

export const useOptimizedNavigation = (links: NavigationLink[]) => {
  const router = useRouter();
  const pathname = usePathname();

  // Prefetch all routes on mount
  useEffect(() => {
    links.forEach((link) => {
      router.prefetch(link.href);
    });
  }, [links, router]);

  const navigateTo = useCallback((href: string) => {
    // Use router.push for client-side navigation
    router.push(href);
  }, [router]);

  const isActive = useCallback((href: string) => {
    const normalize = (str: string) => str.replace(/\/$/, "");
    return normalize(pathname).endsWith(normalize(href));
  }, [pathname]);

  return {
    navigateTo,
    isActive,
    pathname,
  };
}; 