import fs from 'fs';

const DB_FILE = './database.json';

try {
  if (fs.existsSync(DB_FILE)) {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    if (data.testimonials && Array.isArray(data.testimonials)) {
      data.testimonials = data.testimonials.map((t: any) => ({
        ...t,
        rating: t.rating || 5
      }));
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
      console.log('Patched database.json successfully');
    }
  } else {
    console.log('database.json not found, skipping patch.');
  }
} catch (err) {
  console.error('Error patching:', err);
}
