import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

export default class TempService {
	private readonly filename;

	constructor(filename: string) {
		this.filename = filename;

		this.initializeTempLocation();
		this.initializeTempMem();
	}

	private initializeTempLocation() {
		const pathTempFolder = `${__dirname}/../tmp`;
		if (!existsSync(pathTempFolder)) {
			mkdirSync(pathTempFolder);
		}
	}

	private initializeTempMem() {
		const pathTempFile = `${__dirname}/../tmp/${this.filename}.tmp`;
		if (!existsSync(pathTempFile)) {
			writeFileSync(pathTempFile, '[{}]', {flag: 'w'});
		}
	}

	public async readTempMem() {
		const pathTempFile = `${__dirname}/../tmp/${this.filename}.tmp`;
		return await readFile(pathTempFile, {encoding: 'utf-8'});
	}

	public writeTempMem(data: string) {
		const pathTempFile = `${__dirname}/../tmp/${this.filename}.tmp`;
		writeFileSync(pathTempFile, data, {flag: 'w'});
	}
}
