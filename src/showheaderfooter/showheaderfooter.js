import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ShowHeaderFooterUI from './showheaderfooterui';

export default class ShowHeaderFooter extends Plugin {
	static get requires() {
		return [ ShowHeaderFooterUI ];
	}
}
