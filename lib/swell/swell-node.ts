import swell from 'swell-node';

function initSwell(): any {
  swell.init(
    process.env.SWELL_STORE_ID ?? '',
    process.env.SWELL_SECRET_KEY ?? '',
  );
  return swell;
}

export { initSwell };
