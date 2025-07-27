import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

console.log("✅ PUBLIC:", process.env.IMAGEKIT_PUBLIC_KEY);
console.log("✅ PRIVATE:", process.env.IMAGEKIT_PRIVATE_KEY);
console.log("✅ ENDPOINT:", process.env.IMAGEKIT_URL_ENDPOINT);
