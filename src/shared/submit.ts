export interface SaveMethod {
    save(obj: any): void;
}

export function get_default_save_method(): SaveMethod {
	return new RedirectSaveMethod("https://survey.peasec.de/index.php/771938?newtest=Y&lang=de", "../../failure.html", "tic");
}

export class RedirectSaveMethod {
	redirect_uri_base: string;
	error_uri: string;
	session_token_name: string;

	constructor(uri: string, err: string, token_name: string) {
		this.redirect_uri_base = uri;
		this.error_uri = err;
		this.session_token_name = token_name;
	}

	async save(obj: any) {

		// let data = new Buffer(JSON.stringify(obj)).toString('base64');
		let mparams= new URLSearchParams(window.location.search);

		if (!mparams.has('session') || !mparams.get('session')) {
			window.location.replace(this.error_uri);
			return;
		}

		let url = new URL(this.redirect_uri_base);
		let params = new URLSearchParams(url.search);

		params.set('session', mparams.get('session'));
		
		console.log('Saving');

		// TODO: put these into an optional list? or as member variable
		for (let obj_key in obj) {
			if (obj_key === 'session')
				continue;
			if (obj_key === 'nudge') {
				params.set('nudge', obj[obj_key]);
				continue;
			}
			let buf = new Buffer(JSON.stringify(obj[obj_key]));
			params.set(obj_key, buf.toString('base64'));
		}
		url.search = params.toString();

		window.location.replace(url.toString());
	}
}
