/**
 * Percent-encoding (RFC 3986) in four flavours: URI component, full URI,
 * HTML form encoding (`application/x-www-form-urlencoded`, spaces as `+`) and
 * "everything", which escapes every single UTF-8 byte.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { utf8Encode } from '../../util/bytes';

export const url = defineTransform({
  kind: 'transform',
  id: 'url',
  category: 'encodings',
  keywords: ['url', 'uri', 'percent', 'encodeURIComponent', 'querystring'],
  sample: { encode: 'https://eleet.ir/?q=leet speak & ciphers#سلام' },
  options: [
    opt.select('mode', ['component', 'uri', 'form', 'all'], 'component', { control: 'segmented' }),
  ],
  encode: (input, o) => {
    // Lone surrogates cannot be expressed in UTF-8 (encodeURIComponent would throw URIError).
    if (!input.isWellFormed()) throw new TransformError('invalidUtf8');
    switch (o.mode) {
      case 'uri':
        return encodeURI(input);
      case 'form':
        return encodeURIComponent(input).replace(/%20/g, '+');
      case 'all':
        return [...utf8Encode(input)]
          .map((b) => '%' + b.toString(16).toUpperCase().padStart(2, '0'))
          .join('');
      default:
        return encodeURIComponent(input);
    }
  },
  decode: (input, o) => {
    try {
      return decodeURIComponent(o.mode === 'form' ? input.replace(/\+/g, ' ') : input);
    } catch {
      throw new TransformError('invalidPercent');
    }
  },
  detect: (input) => ((input.match(/%[0-9a-f]{2}/gi)?.length ?? 0) >= 2 ? 0.9 : 0),
});
