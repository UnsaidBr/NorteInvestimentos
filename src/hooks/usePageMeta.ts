import { useEffect } from 'react';

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const fullTitle = title.includes('NorteInvest')
      ? title
      : `${title} | NorteInvest`;
    document.title = fullTitle;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }
  }, [title, description]);
}
