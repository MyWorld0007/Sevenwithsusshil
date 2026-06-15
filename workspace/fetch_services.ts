import http from 'http';

http.get('http://localhost:3000/api/services', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const services = JSON.parse(data);
      console.log('SERVICES LIST:');
      services.forEach((s: any, i: number) => {
        console.log(`${i+1}. ${s.title}`);
      });
    } catch (e) {
      console.error(e);
      console.log('RAW_DATA:', data);
    }
  });
}).on('error', (e) => {
  console.error('ERROR:', e.message);
});
