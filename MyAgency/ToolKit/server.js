import express from 'express';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Service Orchestration --------------------------------------------------
const rootDir = path.join(__dirname, '..');
const services = [
	{
		id: 'sales-mandate',
		name: 'Sales Mandate Creator',
		cwd: path.join(rootDir, 'SalesMandateCreator'),
		port: 3000,
	},
	{
		id: 'sales-listing',
		name: 'Sales Listing Creator',
		cwd: path.join(rootDir, 'SalesListingCreator'),
		port: 3001,
	},
	{
		id: 'rental-mandate',
		name: 'Rentals Mandate Creator',
		cwd: path.join(rootDir, 'RentalsMandateCreator'),
		port: 3003, // avoid 3001 conflict
	},
	{
		id: 'rental-listing',
		name: 'Rental Listing Creator',
		cwd: path.join(rootDir, 'RentalListingCreator'),
		port: 3002,
	},
];

/** @type {Map<string, import('child_process').ChildProcess>} */
const children = new Map();

function log(id, msg){
	const ts = new Date().toISOString().split('T')[1].replace('Z','');
	// eslint-disable-next-line no-console
	console.log(`[${ts}] [${id}] ${msg}`);
}

function ensureInstalled(service){
	const nm = path.join(service.cwd, 'node_modules');
	if (fs.existsSync(nm)) return Promise.resolve();
	log(service.id, 'node_modules not found, running npm install…');
	return new Promise((resolve, reject) => {
		const p = spawn('npm', ['install'], { cwd: service.cwd, shell: true, stdio: 'inherit' });
		p.on('exit', code => code === 0 ? resolve() : reject(new Error(`npm install exit ${code}`)));
		p.on('error', reject);
	});
}

function startService(service){
	return ensureInstalled(service)
		.catch(err => { log(service.id, `install failed: ${err.message}`); })
		.finally(() => new Promise((resolve) => {
			log(service.id, `starting on port ${service.port}…`);
			const child = spawn('npm', ['start'], {
				cwd: service.cwd,
				shell: true,
				env: { ...process.env, PORT: String(service.port) },
			});
			children.set(service.id, child);
			child.stdout?.on('data', d => log(service.id, String(d).trim()));
			child.stderr?.on('data', d => log(service.id, String(d).trim()));
			child.on('exit', code => log(service.id, `exited with code ${code}`));
			// Resolve immediately; app may take a moment to boot
			resolve();
		}));
}

async function startAll(){
	for (const svc of services){
		try { await startService(svc); } catch (e) { log(svc.id, `failed to start: ${e.message}`); }
	}
}

function stopAll(){
	for (const [id, proc] of children.entries()){
		try {
			log(id, 'stopping…');
			if (process.platform === 'win32') {
				spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t']);
			} else {
				proc.kill('SIGTERM');
			}
		} catch {/* no-op */}
	}
}

// Serve the ToolKit static files
app.use(express.static(__dirname));

// Serve OTP Creator under /otp/ by mapping to the sibling folder
app.use('/otp', express.static(path.join(__dirname, '..', 'OTPCreator')));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`ToolKit running at http://localhost:${PORT}`);
	// Fire up the creator services in the background
	startAll();
});

// Graceful shutdown
process.on('SIGINT', () => { stopAll(); process.exit(0); });
process.on('SIGTERM', () => { stopAll(); process.exit(0); });
