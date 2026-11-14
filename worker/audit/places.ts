// The Google Business Profile (spec §5.3), from the Places API's Text Search
// (New). Off until Places billing is on in Google Cloud (AUDIT_PLACES=true).
// The search uses the business's own name and town, and a listing only
// counts when its website is the audited site, so another business's profile
// is never mistaken for theirs. The field mask asks for basic fields only,
// keeping each lookup in the cheapest tier.

import type { BusinessData, ProfileFacts } from './facts';

const FIELDS = [
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.rating',
  'places.userRatingCount',
  'places.primaryTypeDisplayName',
  'places.websiteUri',
].join(',');

interface Place {
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: { text?: string };
  websiteUri?: string;
}

const squash = (text: string | null | undefined) => (text ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const digits = (text: string | null | undefined) => (text ?? '').replace(/\D/g, '').replace(/^44/, '0');
const hostOf = (url: string | undefined) => {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, '') : null;
  } catch {
    return null;
  }
};

/**
 * Looks the business up and compares the listing with the site. `query` is
 * the business's name and town as the site gives them (structured data, else
 * the home page title); `site` is what the site says, for the comparison.
 */
export async function findProfile(
  key: string,
  domain: string,
  query: string,
  site: { business: BusinessData | null; phone: string | null }
): Promise<ProfileFacts> {
  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key.trim(),
      'X-Goog-FieldMask': FIELDS,
    },
    body: JSON.stringify({ textQuery: query, regionCode: 'GB', languageCode: 'en-GB', pageSize: 5 }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Places ${response.status}`);
  const { places = [] } = (await response.json()) as { places?: Place[] };
  const place = places.find((p) => hostOf(p.websiteUri) === domain);
  if (!place) {
    return {
      found: false, name: null, address: null, phone: null, rating: null, reviews: null,
      category: null, website: null, nameMatches: null, addressMatches: null, phoneMatches: null,
    };
  }

  const name = place.displayName?.text ?? null;
  const siteName = site.business?.name ?? null;
  const siteAddress = site.business?.address ?? null;
  const sitePhone = site.business?.telephone ?? site.phone;
  // the postcode is the surest sign two addresses are the same place
  const postcode = (text: string | null | undefined) => text?.toUpperCase().match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/)?.[0]?.replace(/\s/g, '') ?? null;

  return {
    found: true,
    name,
    address: place.formattedAddress ?? null,
    phone: place.nationalPhoneNumber ?? null,
    rating: place.rating ?? null,
    reviews: place.userRatingCount ?? null,
    category: place.primaryTypeDisplayName?.text ?? null,
    website: place.websiteUri ?? null,
    nameMatches: siteName && name ? squash(siteName) === squash(name) : null,
    addressMatches:
      siteAddress && place.formattedAddress
        ? postcode(siteAddress) !== null && postcode(siteAddress) === postcode(place.formattedAddress)
        : null,
    phoneMatches: sitePhone && place.nationalPhoneNumber ? digits(sitePhone) === digits(place.nationalPhoneNumber) : null,
  };
}
