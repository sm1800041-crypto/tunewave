const APPLE_API = 'https://itunes.apple.com/search';

export async function searchAppleCatalogue(
  params,
  signal
) {
  const searchParams = new URLSearchParams(params);

  const response = await fetch(
    `${APPLE_API}?${searchParams.toString()}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error('Song search failed');
  }

  return await response.json();
}