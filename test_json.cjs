const fs = require('fs');
try {
  const data = JSON.parse(fs.readFileSync('database.json', 'utf8'));
  console.log("JSON is valid! Has testimonials:", data.testimonials?.length);
} catch(e) {
  console.log("JSON parse error:", e.message);
}
