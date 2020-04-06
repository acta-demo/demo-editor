import Command from '@ckeditor/ckeditor5-core/src/command';

export default class ViewModeChangeCommand extends Command {
	execute({ value }) {
		const editor = this.editor;
		
		editor.set('viewmode', value);
		editor.editing.view.change(writer => {
			const doc = ['header', 'content', 'footer'];
			doc.forEach( docelement => {
				const root = writer.document.getRoot(docelement);
				const arrayElements = root.getChildren();
				for (const paragraph_element of arrayElements) {
					const inner_elements = paragraph_element.getChildren();
					for (const inner_element of inner_elements) {
						if (inner_element.name == 'span') {//Strings, Snipets, References, etc.
							inner_element._setAttribute('data-viewmode', value);
							this.handlespan(inner_element, value);

						}
					}
				}

			});
		});

	}

	refresh() {
		this.isEnabled = true;
	}

	handlespan(propertyName, viewmode) {
		const _data = propertyName.getChild(0)._textData;
		const _class = propertyName.getAttribute('class');
		if (viewmode) {
			if (viewmode === 'coloredview') {
				const _dataSimple = _data.replace(/(^{wrd_str:[^:]*:)|(}$)/g, '');
				propertyName.getChild(0)._data = _dataSimple;
				if (!_class.includes('standardword')) {
					propertyName._setAttribute('class', 'standardword ' + _class);
				}
			} else if (viewmode === 'infoview' && !/(^{wrd_str:[^:]*:)|(}$)/g.test(propertyName.getChild(0)._data)) {
				const _id = propertyName.getAttribute('data-id');
				propertyName.getChild(0)._data = '{wrd_str:' + _id + ':' + propertyName.getChild(0)._data + '}';
				if (!_class.includes('standardword')) {
					propertyName._setAttribute('class', 'standardword ' + _class);
				}
			} else if (viewmode === 'simpleview' && /standardword/g.test(propertyName.getAttribute('class'))) {
				const _dataSimple = _data.replace(/(^{wrd_str:[^:]*:)|(}$)/g, '');
				propertyName.getChild(0)._data = _dataSimple;
				const _class = propertyName.getAttribute('class').replace(/standardword/g, '').replace(/\s\s+/g, ' ').trim();
				propertyName._setAttribute('class', _class);
			}
		}

	}
}