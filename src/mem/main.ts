import sjcl = require("sjcl");
import { SaveMethod, RedirectSaveMethod } from '../shared/submit';

class App {
	save_method: SaveMethod;

	password: HTMLInputElement;
	submit: HTMLButtonElement;
	cannot_remember: HTMLButtonElement;

	session: string;
	cmp_hash: string;

	failed_tries: number;

	constructor() {
		window.onload = () => this.init();

		this.failed_tries = 0;
		this.save_method = new RedirectSaveMethod("https://survey.peasec.de/index.php/734368", "../failure.html", "session");
	}

	init() {
		this.password = <HTMLInputElement> document.getElementById('password');
		this.submit = <HTMLButtonElement> document.getElementById('submit');
		this.cannot_remember = <HTMLButtonElement> document.getElementById('cancel');

		this.submit.onclick = () => this.check_password();
		this.cannot_remember.onclick = () => this.cancel();

		this.parseUrl();

		console.log("session: " + this.session);
		console.log("cmp_hash: " + this.cmp_hash);
	}

	parseUrl() {
		let url = new URL(window.location.href);
		this.session = url.searchParams.get("session");
		let buf = new Buffer(url.searchParams.get('cmp'), 'base64');
		this.cmp_hash = JSON.parse(buf.toString());
	}

	check_password() {
		let hash = this.get_password_hash();
		console.info("New Hash: " + hash);
		if (hash !== this.cmp_hash && this.failed_tries < 4) {
			alert("Passwort inkorrekt, bitte versuche es nochmal!");
			this.failed_tries += 1;
		} else {
			let tries = this.failed_tries;
			if (hash !== this.cmp_hash) {
				tries = -1;
				alert("Es wurde zu oft ein inkorrektes Passwort Passwort eingegeben, du wirst nun weitergeleitet.");
			}

			this.save_method.save({
				session: this.session,
				memdata: tries,
			});
		}
	}

	cancel() {
		if (confirm("Bist du dir sicher?")) {
			this.save_method.save({
				session: this.session,
				memdata: "-1",
			});
		}
	}

	get_password_hash(): string {
		return sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(this.password.value));
	}
}

new App();
