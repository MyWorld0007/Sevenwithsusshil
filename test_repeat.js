console.log('★'.repeat('5'));
try {
  console.log('★'.repeat(null || 5));
  console.log('★'.repeat(undefined || 5)); 
} catch(e) {
  console.log(e);
}
