import swell from 'swell-js';

function initSwell(): any {
  swell.init(
    process.env.NEXT_PUBLIC_SWELL_STORE_ID ?? '',
    process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY ?? '',
  );
  return swell;
}

export { initSwell };
