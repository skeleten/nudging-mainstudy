import { SaveMethod, get_default_save_method } from '../shared/submit';
import {count_classes, get_fast_metrics, get_full_metrics} from '../shared/password';

class App {

	saveMethod: SaveMethod;

	mail: HTMLInputElement;
	username: HTMLInputElement;
	password: HTMLInputElement;
	password_repeat: HTMLInputElement;
	show_password: HTMLInputElement;
	clear_password: HTMLInputElement;
	pw_meter_bar: HTMLElement;

	pwc_common: HTMLDivElement;
	pwc_length: HTMLDivElement;
	pwc_lower: HTMLDivElement;
	pwc_upper: HTMLDivElement;
	pwc_digit: HTMLDivElement;
	pwc_special: HTMLDivElement;
	pwc_complex: HTMLDivElement;

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
		this.password_repeat = <HTMLInputElement> document.getElementById('psw-repeat');
		this.pw_meter_bar = <HTMLElement> document.getElementById('meter-bar');

		this.all_valid = true;

		this.mail.onfocus = () => {
			this.mail.oninput(null);
			let checkbox = <HTMLDivElement> document.getElementById('pw-checkbox');
			checkbox.style.display = 'none';
		};
		this.mail.oninput = () => this.checkMail(this.mail.value);
		this.mail.onkeyup = (e: KeyboardEvent) => this.submitOnEnter(e);

		this.username.onfocus = () => {
			this.username.oninput(null);
			let checkbox = <HTMLDivElement> document.getElementById('pw-checkbox');
			checkbox.style.display = 'none';
		};
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

		this.pwc_common = <HTMLDivElement> document.getElementById('pwc-common');
		this.pwc_length = <HTMLDivElement> document.getElementById('pwc-length');
		this.pwc_lower = <HTMLDivElement> document.getElementById('pwc-lower');
		this.pwc_upper = <HTMLDivElement> document.getElementById('pwc-upper');
		this.pwc_digit = <HTMLDivElement> document.getElementById('pwc-digit');
		this.pwc_special = <HTMLDivElement> document.getElementById('pwc-special');
		this.pwc_complex = <HTMLDivElement> document.getElementById('pwc-complexity');

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

		let complexityExButton = <HTMLButtonElement> document.getElementById('complexity-help');
		complexityExButton.onclick = () => {
			document.getElementById('explanation-popup').style.display = 'block';
		};

		// Initial check if field not empty: in case of website backtracking / cached info
		let groups: HTMLCollection = document.getElementsByClassName('inp_group');
		for (let i = 0; i < groups.length; i++) {
			let field: HTMLInputElement = (<HTMLInputElement> (<HTMLDivElement> groups.item(i)).children.namedItem('inp'));
			if (field.value !== '')
				field.oninput(null);
		}

		this.password_hidden = true;
		this.togglePWVisibility();
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
		let blacklisted = false;
		let score = 4;
		if (value.length < 32) {
			let metrics = get_fast_metrics(value);
			score = metrics.score;
			blacklisted = metrics.blacklisted;
			if (blacklisted) {
				suggestion = 'A lot of people use this password, please choose another one';
				valid = false;
			}
			this.pw_meter_bar.className = "meter-bar-" + metrics.score;
		} else this.pw_meter_bar.className = "meter-bar-4";

		let checkbox = <HTMLDivElement> document.getElementById('pw-checkbox');
		checkbox.style.display = 'inherit';
		this.updateChecklist(value, blacklisted, score);
		let warning = (<HTMLTextAreaElement> document.getElementById('psw_info'));
		warning.innerHTML = '';
		this.password.classList.remove('invalid-entry');
		this.all_valid = valid ? this.all_valid : false;
		return valid;
	}

	updateChecklist(password: string, blacklisted: boolean, score: number) {
		let classes = count_classes(password);

		if (!blacklisted && password) this.pwc_common.classList.add('pwc-satisfied');
		else this.pwc_common.classList.remove('pwc-satisfied');

		if (password.length >= 8) this.pwc_length.classList.add('pwc-satisfied');
		else this.pwc_length.classList.remove('pwc-satisfied');

		if (classes.lower >= 2) this.pwc_lower.classList.add('pwc-satisfied');
		else this.pwc_lower.classList.remove('pwc-satisfied');

		if (classes.capital >= 2) this.pwc_upper.classList.add('pwc-satisfied');
		else this.pwc_upper.classList.remove('pwc-satisfied');

		if (classes.digit >= 2) this.pwc_digit.classList.add('pwc-satisfied');
		else this.pwc_digit.classList.remove('pwc-satisfied');

		if (classes.symbol >= 2) this.pwc_special.classList.add('pwc-satisfied');
		else this.pwc_special.classList.remove('pwc-satisfied');

		if (score >= 3) this.pwc_complex.classList.add('pwc-satisfied');
		else this.pwc_complex.classList.remove('pwc-satisfied');

		let boxes = document.getElementsByClassName('pwc-item');
		for (let i = 0; i < boxes.length; i++) boxes.item(i).children.namedItem('checkbox').classList.replace('fa-check-square', 'fa-square');

		let check = document.getElementsByClassName('pwc-satisfied');
		for (let i = 0; i < check.length; i++) check.item(i).children.namedItem('checkbox').classList.replace('fa-square', 'fa-check-square');
	}

	checkPWConfirm(value: string, compare_to: string) {
		let valid: boolean = value == compare_to;
		let warning = (<HTMLTextAreaElement> document.getElementById('psw_info'));
		warning.style.color = !valid ? '#e31400' : '#18d546';
		this.password_repeat.classList.remove('invalid-entry');
		warning.innerHTML = !valid ? 'Die Passwörter stimmen nicht überein' : '';
		let checkbox = <HTMLDivElement> document.getElementById('pw-checkbox');
		checkbox.style.display = 'inherit';
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
				nudge: 1,
				pwhash: metrics.hash.toString(),
				data: JSON.stringify({
					nudge_id: 1,
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
