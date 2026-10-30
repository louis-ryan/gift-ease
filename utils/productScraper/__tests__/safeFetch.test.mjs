import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPrivateAddress, assertFetchableUrl, fetchHtml } from '../safeFetch.js';

test('private, loopback, link-local and metadata addresses are blocked', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254',
    '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1']) {
    assert.equal(isPrivateAddress(ip), true, ip);
  }
  for (const ip of ['8.8.8.8', '151.101.1.69', '172.32.0.1', '2606:4700::6810:84e5']) {
    assert.equal(isPrivateAddress(ip), false, ip);
  }
});

test('only public http(s) URLs are fetchable', () => {
  for (const url of ['file:///etc/passwd', 'ftp://example.com', 'http://localhost:3000', 'http://127.0.0.1/',
    'http://[::1]/', 'http://169.254.169.254/latest/meta-data', 'https://user:pw@example.com/']) {
    assert.throws(() => assertFetchableUrl(new URL(url)), url);
  }
  assert.doesNotThrow(() => assertFetchableUrl(new URL('https://www.example.com/p/1')));
});

test('a hostname that resolves to a private address is refused at connect time', async () => {
  // localtest.me and its subdomains resolve to 127.0.0.1 in public DNS
  await assert.rejects(fetchHtml('http://shop.localtest.me/', { timeoutMs: 3000 }), (err) => {
    // not_found only if this machine has no DNS; the point is it never connects
    assert.ok(['blocked_address', 'not_found'].includes(err.code), err.code);
    return true;
  });
});
