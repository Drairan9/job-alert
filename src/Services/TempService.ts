import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';

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
			writeFileSync(pathTempFile, '', {flag: 'w'});
		}
	}

	public readTempMem() {
		const pathTempFile = `${__dirname}/../tmp/${this.filename}.tmp`;
		return readFileSync(pathTempFile, {encoding: 'utf-8'});
	}

	public writeTempMem(data: string) {
		const pathTempFile = `${__dirname}/../tmp/${this.filename}.tmp`;
		writeFileSync(pathTempFile, data, {flag: 'w'});
	}
}
