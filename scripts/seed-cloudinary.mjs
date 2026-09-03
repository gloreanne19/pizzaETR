import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment files in priority order
const envFiles = ['.env.production.local', '.env.local', '.env.production', '.env'];
for (const file of envFiles) {
  dotenv.config({ path: path.join(rootDir, file) });
}

async function uploadToCloudinaryRest(filePath, cloudName, apiKey, apiSecret, folder, publicId) {
  const fileBuffer = await fs.readFile(filePath);
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = { folder, timestamp };
  if (publicId) paramsToSign.public_id = publicId;

  const sortedKeys = Object.keys(paramsToSign).sort();
  const stringToSign = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&') + apiSecret;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  const formData = new FormData();
  const blob = new Blob([fileBuffer]);
  formData.append('file', blob);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);
  if (publicId) formData.append('public_id', publicId);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const res = await fetch(endpoint, { method: 'POST', body: formData });
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || 'Upload to Cloudinary failed');
  }

  return data.secure_url;
}

async function runSeed() {
  console.log('\n========================================================');
  console.log('       PAQUITO\'S PIZZA — CLOUDINARY PRODUCTION SEEDER   ');
  console.log('========================================================\n');

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ ERROR: Cloudinary credentials are missing in your .env!');
    console.error('Please configure the following in your .env file:');
    console.error('  CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.error('  CLOUDINARY_API_KEY=your_api_key');
    console.error('  CLOUDINARY_API_SECRET=your_api_secret\n');
    process.exit(1);
  }

  console.log(`📡 Cloudinary Target Account: ${cloudName}`);

  // Database Connection
  const dbHost = process.env.DB_HOST || '127.0.0.1';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || process.env.DB_PASS || '';
  const dbName = process.env.DB_NAME || 'pizza_pizza';
  const dbPort = Number(process.env.DB_PORT) || 3306;

  let connection;
  try {
    const isRemote = dbHost !== '127.0.0.1' && dbHost !== 'localhost' && dbHost !== 'mysql';
    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      port: dbPort,
      ssl: isRemote ? { rejectUnauthorized: false } : undefined,
    });
    console.log(`🗄️  Connected to MySQL Database: ${dbUser}@${dbHost}:${dbPort}/${dbName}\n`);
  } catch (err) {
    console.warn(`⚠️ Warning: Could not connect to MySQL database (${err.message}). Images will still be uploaded to Cloudinary, but database URLs will not be updated automatically.\n`);
  }

  // Folders to scan
  const sourceDirs = [
    { dir: path.join(rootDir, 'public', 'uploaded_img'), cloudFolder: 'pizza_etr/products' },
    { dir: path.join(rootDir, 'public', 'images'), cloudFolder: 'pizza_etr/assets' },
  ];

  const results = [];

  for (const { dir, cloudFolder } of sourceDirs) {
    try {
      const files = await fs.readdir(dir);
      const imageFiles = files.filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f));

      console.log(`📁 Scanning directory: ${path.relative(rootDir, dir)} (${imageFiles.length} images found)`);

      for (const file of imageFiles) {
        const filePath = path.join(dir, file);
        const fileNameNoExt = path.basename(file, path.extname(file));

        try {
          process.stdout.write(`   Uploading "${file}" ... `);
          const secureUrl = await uploadToCloudinaryRest(
            filePath,
            cloudName,
            apiKey,
            apiSecret,
            cloudFolder,
            fileNameNoExt
          );

          process.stdout.write(`✅ Done -> ${secureUrl}\n`);

          results.push({
            file,
            originalPath: path.relative(rootDir, filePath),
            cloudUrl: secureUrl,
            cloudFolder,
          });

          // Update database if connected
          if (connection) {
            // Update products
            await connection.execute(
              'UPDATE products SET image = ? WHERE image = ? OR image LIKE ?',
              [secureUrl, file, `%/${file}`]
            ).catch(() => { });

            // Update favorites
            await connection.execute(
              'UPDATE favorites SET image = ? WHERE image = ? OR image LIKE ?',
              [secureUrl, file, `%/${file}`]
            ).catch(() => { });

            // Update customization
            await connection.execute(
              'UPDATE customization SET cusImage = ? WHERE cusImage = ? OR cusImage LIKE ?',
              [secureUrl, file, `%/${file}`]
            ).catch(() => { });
          }
        } catch (uploadErr) {
          process.stdout.write(`❌ Failed: ${uploadErr.message || uploadErr}\n`);
        }
      }
    } catch (err) {
      console.warn(`Could not read directory ${dir}:`, err.message);
    }
  }

  if (connection) {
    await connection.end();
  }

  console.log('\n========================================================');
  console.log(`🎉 SEEDING COMPLETE! Successfully processed ${results.length} images.`);
  console.log('========================================================\n');
}

runSeed().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});

