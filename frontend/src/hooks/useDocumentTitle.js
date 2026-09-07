import { useEffect } from 'react';

const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} - NewsNepal` : 'NewsNepal - Nepal\'s News Hub';
  }, [title]);
};

export default useDocumentTitle;
