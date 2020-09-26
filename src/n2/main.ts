import { SaveMethod, get_default_save_method } from '../shared/submit';
import { get_fast_metrics, get_full_metrics } from '../shared/password';
import { generate_xkcd_pw } from './passgen';

class App {

	saveMethod: SaveMethod;

	mail: HTMLInputElement;
	username: HTMLInputElement;
	password: HTMLInputElement;
	password_repeat: HTMLInputElement;
	show_password: HTMLInputElement;
	clear_password: HTMLInputElement;
	redo_password: HTMLInputElement;
	all_valid: boolean;
	password_hidden: boolean;

	constructor() {
		window.onload = () => this.init();
		this.saveMethod = get_default_save_method();
	}

	init() {
		this.mail = <HTMLInputElement> document.getElementById('email');
		this.username = <HTMLInputElement> document.getElementById('username');
		this.password = <HTMLInputElement> document.getElementById('psw');
		this.show_password = <HTMLInputElement> document.getElementById('pw-show');
		this.clear_password = <HTMLInputElement> document.getElementById('pw-clear');
		this.redo_password = <HTMLInputElement> document.getElementById('pw-regenerate');
		this.password_repeat = <HTMLInputElement> document.getElementById('psw-repeat');

		this.all_valid = true;

		this.mail.onfocus = () => this.mail.oninput(null);
		this.mail.oninput = () => this.checkMail(this.mail.value);
		this.mail.onkeyup = (e: KeyboardEvent) => this.submitOnEnter(e);

		this.username.onfocus = () => this.username.oninput(null);
		this.username.oninput = () => this.checkUsername(this.username.value);
		this.username.onkeyup = (e: KeyboardEvent) => this.submitOnEnter(e);

		this.password.onfocus = () => this.password.oninput(null);
		this.password.oninput = () => this.checkPassword(this.password.value);
		this.password.onkeyup = (e: KeyboardEvent) => this.submitOnEnter(e);

		this.password_repeat.onfocus = () => this.password_repeat.oninput(null);
		this.password_repeat.oninput = () => this.checkPWConfirm(this.password_repeat.value, this.password.value);
		this.password_repeat.onkeyup = (e: KeyboardEvent) => this.submitOnEnter(e);

		this.show_password.onclick = () => this.togglePWVisibility();

		this.clear_password.onclick = () => {
			this.password.value = "";
			this.password_repeat.value = "";
			(<HTMLTextAreaElement> document.getElementById('psw_info')).innerHTML = '';
		};

		this.redo_password.onclick = () => this.generateDefaultPW(true);

		let btn = document.getElementById('submit_btn');
		btn.onclick = () => {
			// Check constraints and store result in all_valid
			this.all_valid = true;
			if (!this.mail.oninput(null))
				this.mail.classList.add('invalid-entry');
			if (!this.username.oninput(null))
				this.username.classList.add('invalid-entry');
			if (!this.password_repeat.oninput(null))
				this.password_repeat.classList.add('invalid-entry');
			if (!this.password.oninput(null))
				this.password.classList.add('invalid-entry');
			// Submit
			this.onSubmitClick(this.all_valid)
		};

		let closeExButton = <HTMLButtonElement> document.getElementById('close-explanation');
		closeExButton.onclick = () => {
			document.getElementById('explanation-popup').style.display = 'none';
		};

		let openExButton = <HTMLButtonElement> document.getElementById('pw-help');
		openExButton.onclick = () => {
			document.getElementById('explanation-popup').style.display = 'block';
		};

		// Initial check if field not empty: in case of website backtracking / cached info
		let groups: HTMLCollection = document.getElementsByClassName('inp_group');
		for (let i = 0; i < groups.length; i++) {
			let field: HTMLInputElement = (<HTMLInputElement> (<HTMLDivElement> groups.item(i)).children.namedItem('inp'));
			if (field.value !== '')
				field.oninput(null);
		}

		this.password_hidden = false;
		this.togglePWVisibility();
		this.generateDefaultPW(false);
	}

	submitOnEnter(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			document.getElementById("submit_btn").click();
		}
	}

	togglePWVisibility() {
		this.password.type = !this.password_hidden ? "text" : "password";
		this.password_repeat.type = !this.password_hidden ? "text" : "password";
		this.password_hidden = !this.password_hidden;
		this.show_password.classList.toggle("fa-eye-slash");
	}

	generateDefaultPW(ignore_content: boolean) {
		generate_xkcd_pw().then(pw => {
			if (!ignore_content && this.password.value) return;
			this.password.value = pw;
			//this.password_repeat.value = pw;
			this.password.oninput(null);
			//this.password_repeat.oninput(null);
			document.getElementById('gen-info').style.display = 'block';
			if (!this.password_hidden) this.togglePWVisibility();
		});
	}

	checkMail(value: string) {
		let valid: boolean = value.match('.*@.*') != null;
		let warning = (<HTMLTextAreaElement> document.getElementById('mail_info'));
		warning.style.display = !valid ? 'inline-block' : 'none';
		warning.style.color = !valid ? '#e31400' : '#18d546';
		this.mail.classList.remove('invalid-entry');
		warning.innerHTML = !valid ? 'Bitte gib eine gültige Mailadresse ein' : '';
		this.all_valid = valid ? this.all_valid : false;
		return valid;
	}

	checkUsername(value: string) {
		let valid: boolean = value.length != 0;
		let warning = (<HTMLTextAreaElement> document.getElementById('username_info'));
		warning.style.display = 'inline-block';
		warning.style.color = !valid ? '#e31400' : '#18d546';
		this.username.classList.remove('invalid-entry');
		warning.innerHTML = !valid ? 'Bitte suche dir einen Anmeldenamen aus' : 'Anmeldename verfügbar';
		this.all_valid = valid ? this.all_valid : false;
		return valid;
	}

	checkPassword(value: string) {
		let valid: boolean = value.length >= 8;
		let suggestion = '';
		if (value.length < 32) {
			let metrics = get_fast_metrics(value);
			if (metrics.blacklisted) {
				suggestion = 'Dieses Passwort ist sehr verbreitet, bitte nutze ein anderes';
				valid = false;
			}
		}
		let warning = (<HTMLTextAreaElement> document.getElementById('psw_info'));
		warning.style.color = !valid ? '#e31400' : '#18d546';
		this.password.classList.remove('invalid-entry');
		warning.innerHTML = !valid ? (suggestion != '' ? suggestion : 'Das Passwort muss mindestens 8 Zeichen lang sein') : '';
		this.all_valid = valid ? this.all_valid : false;
		return valid;
	}

	checkPWConfirm(value: string, compare_to: string) {
		let valid: boolean = value == compare_to;
		let warning = (<HTMLTextAreaElement> document.getElementById('psw_info'));
		warning.style.color = !valid ? '#e31400' : '#18d546';
		this.password_repeat.classList.remove('invalid-entry');
		warning.innerHTML = !valid ? 'Die Passwörter stimmen nicht überein' : '';
		this.all_valid = valid ? this.all_valid : false;
		return valid;
	}

	onSubmitClick(checks_valid: boolean) {
		console.log(checks_valid ? 'Submitting!' : 'Constraints not satisfied.');
		if (!checks_valid) return;
		this.password.type = 'password';
		this.password_repeat.type = 'password';
		// Decode via:
		// var b = new Buffer(BASE64 STRING, 'base64')
		// var s = b.toString();
		let metrics = get_full_metrics(this.password.value);
		let payload =
			{
				nudge: 2,
				pwhash: metrics.hash.toString(),
				data: JSON.stringify({
					nudge_id: 2,
					username: this.username.value,
					mail: this.mail.value,
					metrics: metrics,
				}),
			};
		this.saveMethod.save(payload);
	}
}

// KEEP THIS
// This is so we can inspect the state, if need be.
var _app = new App();
