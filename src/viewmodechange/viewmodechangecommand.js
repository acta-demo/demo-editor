import Command from '@ckeditor/ckeditor5-core/src/command';
import UIElement from '@ckeditor/ckeditor5-engine/src/view/uielement';
import Element from '@ckeditor/ckeditor5-engine/src/view/element';

export default class ViewModeChangeCommand extends Command {
	execute({ value }) {
		const editor = this.editor;
		
		editor.set('viewmode', value);
		/*
		editor.model.change(modelWriter => {
			const doc = ['header', 'content', 'footer'];
			doc.forEach( docelement => {
				const root = editor.model.document.getRoot(docelement);
				const arrayElements = root.getChildren();//get paragraphs
				for (const paragraph_element of arrayElements) {
					const inner_elements = paragraph_element.getChildren();
					for (const inner_element of inner_elements) {
						console.log('#### ViewModeChangeCommand inner_element:', inner_element);
						if (inner_element.name == 'str') {
							modelWriter.setAttribute('data-viewmode', value, inner_element);
							console.log('#### ViewModeChangeCommand str inner_element:', inner_element);
						}
					}
				}

			});
		});
		*/
		editor.editing.view.change(viewWriter => {
			const doc = ['header', 'content', 'footer'];
			doc.forEach( docelement => {
				const root = viewWriter.document.getRoot(docelement);
				const arrayElements = root.getChildren();
				for (const paragraph_element of arrayElements) {
					const inner_elements = paragraph_element.getChildren();
					for (const inner_element of inner_elements) {
						if (inner_element.name == 'span') {//Strings, References, etc.
							viewWriter.setAttribute('data-viewmode', value, inner_element);
							//inner_element._setAttribute('data-viewmode', value);
							this.handlespan(inner_element, value);

						} else if (inner_element.name == 'div') {//Snippets
							viewWriter.setAttribute('data-viewmode', value, inner_element);
							this.handlediv(inner_element, value, viewWriter);
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
				const _dataSimple = _data.replace(/(^{str:[^:]*:)|(}$)/g, '');
				propertyName.getChild(0)._data = _dataSimple;
				if (!_class.includes('standardword')) {
					propertyName._setAttribute('class', 'standardword ' + _class);
				}
			} else if (viewmode === 'infoview' && !/(^{str:[^:]*:)|(}$)/g.test(propertyName.getChild(0)._data)) {
				const _id = propertyName.getAttribute('data-id');
				propertyName.getChild(0)._data = '{str:' + _id + ':' + propertyName.getChild(0)._data + '}';
				if (!_class.includes('standardword')) {
					propertyName._setAttribute('class', 'standardword ' + _class);
				}
			} else if (viewmode === 'simpleview' && /standardword/g.test(propertyName.getAttribute('class'))) {
				const _dataSimple = _data.replace(/(^{str:[^:]*:)|(}$)/g, '');
				propertyName.getChild(0)._data = _dataSimple;
				const _class = propertyName.getAttribute('class').replace(/standardword/g, '').replace(/\s\s+/g, ' ').trim();
				propertyName._setAttribute('class', _class);
			}
		}

	}

	handlediv(divelement, viewmode, viewWriter) {
		console.log('#### handlediv divelement:', divelement);
		console.log('#### handlediv viewmode:', viewmode);
		const _id = divelement.getAttribute('data-id');
		let _class = divelement.getAttribute('class');
		if (viewmode === 'coloredview' && divelement.getAttribute('data-type') === 'snp') {
			console.log('#### handlediv COLOREDVIEW');
			_class = _class.replace('snippet_simpleview', '');
			_class = (_class.includes('snipet'))? _class : 'snippet ' + _class;
			_class = _class.replace(/\s\s+/g, ' ');
			viewWriter.setAttribute('class', _class, divelement);
			viewWriter.setAttribute('data-before', '', divelement);
			viewWriter.setAttribute('data-after', '', divelement);
		} else if (viewmode === 'simpleview' && divelement.getAttribute('data-type') === 'snp') {
			console.log('#### handlediv SIMPLEVIEW');
			_class = _class.replace('snippet', '');
			_class = (_class.includes('snippet_simpleview'))? _class : 'snippet_simpleview ' + _class;
			_class = _class.replace(/\s\s+/g, ' ');
			viewWriter.setAttribute('class', _class, divelement);
			viewWriter.setAttribute('data-before', '', divelement);
			viewWriter.setAttribute('data-after', '', divelement);
		} else if (viewmode === 'infoview' && divelement.getAttribute('data-type') === 'snp') {
			console.log('#### handlediv INFOVIEW');
			_class = _class.replace('snippet_simpleview', '');
			_class = (_class.includes('snipet'))? _class : 'snippet ' + _class;
			_class = _class.replace(/\s\s+/g, ' ');
			viewWriter.setAttribute('class', _class, divelement);
			viewWriter.setAttribute('data-before', '{snp:' + _id + ':', divelement);
			viewWriter.setAttribute('data-after', '}', divelement);
		}

		const childs = divelement.getChildren();
		for(const element of childs) {
			console.log('#### element:', element);
			if (element instanceof UIElement && viewmode !== 'infoview') {
				viewWriter.setAttribute('style', 'display:none;', element);
			} else if (element instanceof UIElement && viewmode === 'infoview') {
				console.log('#### element inside div:', element);
				viewWriter.removeAttribute('style', element);
			} else if (element instanceof Element && element.name === 'span') {
				console.log('#### element inside div:', element);
				this.handlespan(element, viewmode);

			}
			//const _datatype = spanelement.getAttribute('data-type');
		}
		/*const _data = propertyName.getChild(0)._textData;
		const _class = propertyName.getAttribute('class');
		if (viewmode) {
			if (viewmode === 'coloredview') {
				const _dataSimple = _data.replace(/(^{str:[^:]*:)|(}$)/g, '');
				propertyName.getChild(0)._data = _dataSimple;
				if (!_class.includes('standardword')) {
					propertyName._setAttribute('class', 'standardword ' + _class);
				}
			} else if (viewmode === 'infoview' && !/(^{str:[^:]*:)|(}$)/g.test(propertyName.getChild(0)._data)) {
				const _id = propertyName.getAttribute('data-id');
				propertyName.getChild(0)._data = '{str:' + _id + ':' + propertyName.getChild(0)._data + '}';
				if (!_class.includes('standardword')) {
					propertyName._setAttribute('class', 'standardword ' + _class);
				}
			} else if (viewmode === 'simpleview' && /standardword/g.test(propertyName.getAttribute('class'))) {
				const _dataSimple = _data.replace(/(^{str:[^:]*:)|(}$)/g, '');
				propertyName.getChild(0)._data = _dataSimple;
				const _class = propertyName.getAttribute('class').replace(/standardword/g, '').replace(/\s\s+/g, ' ').trim();
				propertyName._setAttribute('class', _class);
			}
		}*/

	}
}