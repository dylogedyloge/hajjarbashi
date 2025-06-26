import { useParams } from 'next/navigation';

export function useLocaleDirection() {
  const params = useParams();
  const locale = params?.locale as string;
  const isRTL = locale === 'fa';
  const dir = isRTL ? 'rtl' : 'ltr';
  
  return {
    isRTL,
    dir,
  };
} 