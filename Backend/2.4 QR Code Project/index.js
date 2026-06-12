import inquirer from 'inquirer';
import qr from 'qr-image';
import { writeFile } from 'node:fs/promises';

async function main() {
		// 1) Get URL from CLI/env or prompt the user
		let url = process.argv[2] || process.env.URL;
		if (!url) {
			const answers = await inquirer.prompt([
				{
					type: 'input',
					name: 'url',
					message: 'Enter a URL to encode as a QR code:',
					validate: (value) => (value && value.trim().length > 0 ? true : 'Please enter a URL'),
				},
			]);
			url = answers.url;
		}

	// 2) Generate a QR code PNG from the URL
	const pngBuffer = qr.imageSync(url, { type: 'png' });

	// 3) Save the QR code image and the URL to files
	await writeFile('qr_img.png', pngBuffer);
	await writeFile('URL.txt', url, { encoding: 'utf-8' });

	console.log('QR code saved to qr_img.png');
	console.log('URL saved to URL.txt');
}

main().catch((err) => {
	console.error('Something went wrong:', err);
	process.exit(1);
});
