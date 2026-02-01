import { ENV } from './server/_core/env.js';

const baseUrl = ENV.forgeApiUrl.replace(/\/+$/, '') + '/';
const downloadApiUrl = new URL('v1/storage/downloadUrl', baseUrl);
downloadApiUrl.searchParams.set('path', 'products/3oZIPIHty7fNGvTPo583R.png');

console.log('Request URL:', downloadApiUrl.toString());

const response = await fetch(downloadApiUrl, {
  method: 'GET',
  headers: { Authorization: 'Bearer ' + ENV.forgeApiKey },
});

console.log('Status:', response.status);
const data = await response.json();
console.log('Response:', JSON.stringify(data, null, 2));

// Test if the returned URL is accessible
if (data.url) {
  console.log('\nTesting returned URL...');
  const imgResponse = await fetch(data.url, { method: 'HEAD' });
  console.log('Image URL Status:', imgResponse.status);
}
