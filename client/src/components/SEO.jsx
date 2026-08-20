import { useEffect } from 'react';

/**
 * Reusable SEO component to update the document head elements dynamically.
 * Helps with crawler indexing and social media preview tags.
 */
const SEO = ({ title, description, keywords, image, path = '' }) => {
  const siteName = 'SN Infra';
  const defaultTitle = 'SN Infra | Best Building Construction in Coimbatore & Pollachi';
  const defaultDesc = 'SN Infra is the leading construction company in Coimbatore & Pollachi. We specialize in premium building construction, DTCP building approval, Vastu-compliant structures, structural design, and renovations.';
  const defaultKeywords = 'construction at Coimbatore, construction company in Coimbatore, best builders in Coimbatore, building approval Coimbatore, construction Pollachi, building contractors Coimbatore, SN Infra';
  const baseUrl = 'https://sninfra.onrender.com';

  useEffect(() => {
    // 1. Title tag
    document.title = title ? `${siteName} | ${title}` : defaultTitle;

    // 2. Meta description tag
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || defaultDesc);
    }

    // 3. Meta keywords tag
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords || defaultKeywords);
    }

    // 4. OpenGraph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title ? `${siteName} | ${title}` : defaultTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description || defaultDesc);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', `${baseUrl}${path}`);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', image || `${baseUrl}/logo.png`);

    // 5. Twitter Card Tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', title ? `${siteName} | ${title}` : defaultTitle);

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', description || defaultDesc);

    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute('content', `${baseUrl}${path}`);

    const twitterImage = document.querySelector('meta[property="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', image || `${baseUrl}/logo.png`);

  }, [title, description, keywords, image, path]);

  return null;
};

export default SEO;
