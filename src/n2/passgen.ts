import { pw_gen } from './pwgen';

let generated: string = '';

export function generate_xkcd_pw() {
	return pw_gen(null, 4, false, false).then(words => {
		generated = words.join('-').replace(/\s+/g, "").toLowerCase();
		return (generated);
	});
}
