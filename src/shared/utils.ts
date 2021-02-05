export const getFavicon = (url: string) => {
  const hostname = new URL(url).hostname;
  if (hostname.includes('github.com')) {
    // because google get it wrong...
    return 'github-favicon.png';
  }
  return `https://s2.googleusercontent.com/s2/favicons?domain_url=${hostname}`;
};

export const getAltFavicon = (url: string) => {
  const hostname = new URL(url).hostname;
  return `https://favicon.zhusl.com/ico?url=${hostname}`;
};
