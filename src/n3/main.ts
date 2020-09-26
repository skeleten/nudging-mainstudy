import { SaveMethod, get_default_save_method } from '../shared/submit';
import { get_fast_metrics, get_full_metrics } from '../shared/password';
import {
	loadResources,
	advanceSprite,
	selectStep,
	disableGuide,
	draw,
	enabled,
	selectGesture,
	selectExactSprite
} from './avatar';

class App {

	saveMethod: SaveMethod;

	mail: HTMLInputElement;
	username: HTMLInputElement;
	password: HTMLInputElement;
	password_repeat: HTMLInputElement;
	show_password: HTMLInputElement;
	clear_password: HTMLInputElement;

	all_valid: boolean;
	password_hidden: boolean;
	missing_field_hint: string;

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

		let btn = document.getElementById('submit_btn');
		btn.onclick = () => {
			// Check constraints and store result in all_valid
			this.all_valid = true;
			this.missing_field_hint = '';
			if (!enabled) {
				if (!this.mail.oninput(null))
					this.mail.classList.add('invalid-entry');
				if (!this.username.oninput(null))
					this.username.classList.add('invalid-entry');
				if (!this.password_repeat.oninput(null))
					this.password_repeat.classList.add('invalid-entry');
				if (!this.password.oninput(null))
					this.password.classList.add('invalid-entry');
			} else {
				this.password_repeat.oninput(null);
				this.password.oninput(null);
				this.username.oninput(null);
				this.mail.oninput(null);
			}
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

		let createButton = <HTMLButtonElement> document.getElementById('create-avatar');
		createButton.onclick = () => {
			document.getElementById('creation-popup').style.display = 'none';
			selectStep(0, []);
		};

		let skipButton = <HTMLButtonElement> document.getElementById('skip-avatar');
		skipButton.onclick = () => {
			alert('Diese Möglichkeit wurde für die Studie deaktiviert. Bitte erstellen Sie einen Avatar.');
			/*document.getElementById('creation-popup').style.display = 'none';
			disableGuide();
			this.checkInitialFields();*/
		};

		let buttons_left = document.getElementsByClassName('sprite-prev');
		for (let i = 0; i < buttons_left.length; i++) {
			let btn = <HTMLInputElement> buttons_left.item(i);
			btn.onclick = () => advanceSprite(false, btn.id.replace('sprite-', '').replace('-prev', ''));
		}

		let buttons_right = document.getElementsByClassName('sprite-next');
		for (let i = 0; i < buttons_right.length; i++) {
			let btn = <HTMLInputElement> buttons_right.item(i);
			btn.onclick = () => advanceSprite(true, btn.id.replace('sprite-', '').replace('-next', ''));
		}

		this.password_hidden = true;
		this.togglePWVisibility();

		(<HTMLInputElement> document.getElementById('sprite-randomize')).onclick = () => advanceSprite(true, 'random');
		loadResources();
		selectExactSprite(2, 0, 1, 1);
	}

	// Initial check if field not empty: in case of website backtracking / cached info
	checkInitialFields() {
		let groups: HTMLCollection = document.getElementsByClassName('inp_group');
		for (let i = 0; i < groups.length; i++) {
			let field: HTMLInputElement = (<HTMLInputElement> (<HTMLDivElement> groups.item(i)).children.namedItem('inp'));
			if (field.value) field.oninput(null);
		}
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
		this.all_valid = valid ? this.all_valid : false;
		this.missing_field_hint = valid ? this.missing_field_hint : 'Mail';
		if (enabled) {
			selectStep(1, [valid ? 'valid' : '', value]);
			return valid;
		}
		let warning = (<HTMLTextAreaElement> document.getElementById('mail_info'));
		warning.style.display = !valid ? 'inline-block' : 'none';
		warning.style.color = !valid ? '#e31400' : '#18d546';
		this.mail.classList.remove('invalid-entry');
		warning.innerHTML = !valid ? 'Bitte gib eine gültige Mailadresse ein' : '';
		return valid;
	}

	checkUsername(value: string) {
		let valid: boolean = value.length != 0;
		this.all_valid = valid ? this.all_valid : false;
		this.missing_field_hint = valid ? this.missing_field_hint : 'Anmeldenamen';
		if (enabled) {
			selectStep(2, [valid ? 'valid' : '', value]);
			return valid;
		}
		let warning = (<HTMLTextAreaElement> document.getElementById('username_info'));
		warning.style.display = 'inline-block';
		warning.style.color = !valid ? '#e31400' : '#18d546';
		this.username.classList.remove('invalid-entry');
		warning.innerHTML = !valid ? 'Bitte suche dir einen Anmeldenamen aus' : 'Anmeldename verfügbar';
		return valid;
	}

	checkPassword(value: string) {
		let valid: boolean = value.length >= 8;
		this.all_valid = valid ? this.all_valid : false;
		this.missing_field_hint = valid ? this.missing_field_hint : 'Passwort';
		let suggestion = '';
		if (value.length < 32) {
			let metrics = get_fast_metrics(value);
			if (metrics.blacklisted) {
				suggestion = 'Dieses Passwort ist sehr verbreitet, bitte nutze ein anderes';
				valid = false;
				this.all_valid = false;
			}
			if (enabled) {
				if (valid && metrics.score < 3) {
					suggestion = 'Dieses Passwort ist okay, aber etwas schwach... ';
					if (metrics.classes.symbol < 2) suggestion += 'füge doch noch ein paar Sonderzeichen hinzu.';
					else if (metrics.classes.digit < 2) suggestion += 'füge doch noch ein paar Ziffern hinzu.';
					else if (metrics.classes.capital < 2) suggestion += 'füge doch noch ein paar Großbuchstaben hinzu.';
					else if (metrics.classes.lower < 2) suggestion += 'füge doch noch ein paar Kleinbuchstaben hinzu.';
					else suggestion += 'versuche mal, die Buchstaben ein bisschen durchzumischen.'
				}
				selectStep(3, [valid ? 'valid' : '', value, suggestion]);
				return valid;
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
		this.all_valid = valid ? this.all_valid : false;
		this.missing_field_hint = valid ? this.missing_field_hint : 'zweite Passwort';
		if (enabled) {
			selectStep(4, [valid ? 'valid' : '', value]);
			return;
		}
		let warning = (<HTMLTextAreaElement> document.getElementById('psw_info'));
		warning.style.color = !valid ? '#e31400' : '#18d546';
		this.password_repeat.classList.remove('invalid-entry');
		warning.innerHTML = !valid ? 'Die Passwörter stimmen nicht überein' : '';
		return valid;
	}

	onSubmitClick(checks_valid: boolean) {
		console.log(checks_valid ? 'Submitting!' : 'Constraints not satisfied.');
		if (!checks_valid) {
			selectStep(5, [ this.missing_field_hint ]);
			return;
		}
		this.password.type = 'password';
		this.password_repeat.type = 'password';
		// Decode via:
		// var b = new Buffer(BASE64 STRING, 'base64')
		// var s = b.toString();
		let metrics = get_full_metrics(this.password.value);
		let payload =
			{
				nudge: 3,
				pwhash: metrics.hash.toString(),
				data: JSON.stringify({
					nudge_id: 3,
					username: this.username.value,
					mail: this.mail.value,
					metrics: metrics,
				}),
			};
		document.getElementById('finished-popup').style.display = 'block';
		document.getElementById('finished-popup').style.backgroundColor = '#f3f3f3';
		document.getElementById('finished-modal-body').style.backgroundColor = '#fefefe';
		document.getElementById('finished-modal-body').appendChild(document.getElementById('sprite-canvas'));
		selectStep(-1, []);
		disableGuide();
		selectGesture(1);
		draw();
		const sm = this.saveMethod;
		setTimeout(function () {
			sm.save(payload);
		}, 3000);
	}
}

// KEEP THIS
// This is so we can inspect the state, if need be.
var _app = new App();
