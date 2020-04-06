import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	toWidget,
	viewToModelPositionOutsideModelElement
} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import StandardWordCommand from './standardwordcommand';
import Util from '../utils/Util';
import './css/standardword.css';


export default class StandardWordEditing extends Plugin {



	static get viewmode() {
		return (typeof this._viewmode !== 'undefined') ? this._viewmode : 'infoview';
	}

	static set viewmode(viewmode) {
		this._viewmode = viewmode;
	}

	static get requires() {
		return [Widget];
	}


	init() {

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add('str', new StandardWordCommand(this.editor));

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement(this.editor.model, viewElement => viewElement.hasClass('standardword'))
		);

		this.listenTo(this.editor, 'change:viewmode', (evt, propertyName, newValue, oldValue) => {
			// Do something when the data is ready.
			StandardWordEditing.viewmode = newValue;
		});

	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register('str', {
			// Allow wherever text is allowed:
			allowWhere: '$text',

			// The str will act as an inline node:
			isInline: true,

			// The inline widget is self-contained so it cannot be split by the caret and it can be selected:
			isObject: true,

			// The str can have many types, like date, name, surname, etc:
			allowAttributes: ['data-id', 'data-content', 'data-type', 'data-viewmode']
		});

	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for('upcast').elementToElement({
			view: {
				name: 'span',
				'data-type': ['str']
			},
			model: (viewElement, modelWriter) => {

				const variableid = viewElement.getAttribute('data-id');
				const _text = viewElement.getChild(0);

				const modelElement = modelWriter.createElement('str', {
					'data-id': variableid,
					'data-content': Util.encodeHTML(_text.data)
				});

				return modelElement;
			}
		});

		conversion.for('editingDowncast').elementToElement({
			model: 'str',
			view: (modelItem, viewWriter) => {
				const widgetElement = createStrEditingView(modelItem, viewWriter);

				// Enable widget handling on a placeholder element inside the editing view.
				return toWidget(widgetElement, viewWriter);
			}
		});

		conversion.for('dataDowncast').elementToElement({
			model: 'str',
			view: createStrDataView
		});

		function createStrEditingView(modelItem, viewWriter) {
			const variableId = modelItem.getAttribute('data-id');
			const textcontent = modelItem.getAttribute('data-content');
			let strView;
			if (StandardWordEditing.viewmode === 'infoview') {
				strView = viewWriter.createContainerElement('span', {
					class: 'standardword', 'data-id': variableId, 'data-viewmode': 'infoview', 'data-type': 'str'
				});
				const innerText = viewWriter.createText('{wrd_str:' + variableId + ':' + Util.decodeHTML(textcontent) + '}');
				viewWriter.insert(viewWriter.createPositionAt(strView, 0), innerText);
			} else if (StandardWordEditing.viewmode === 'coloredview') {
				strView = viewWriter.createContainerElement('span', {
					class: 'standardword', 'data-id': variableId, 'data-viewmode': 'coloredview', 'data-type': 'str'
				});
				const innerText = viewWriter.createText( Util.decodeHTML(textcontent) );
				viewWriter.insert(viewWriter.createPositionAt(strView, 0), innerText);
			} else if (StandardWordEditing.viewmode === 'simpleview') {
				strView = viewWriter.createContainerElement('span', {
					class: '', 'data-id': variableId, 'data-viewmode': 'simpleview', 'data-type': 'str'
				});
				const innerText = viewWriter.createText( Util.decodeHTML(textcontent) );
				viewWriter.insert(viewWriter.createPositionAt(strView, 0), innerText);
			}
			
			return strView;
		}

		function createStrDataView(modelItem, viewWriter) {

			const variableId = modelItem.getAttribute('data-id');
			const textcontent = modelItem.getAttribute('data-content');

			const strView = viewWriter.createContainerElement('span', {
				class: 'standardword', 'data-id': variableId, 'data-type': 'str'
			});

			// Insert the str (as a text).
			const innerText = viewWriter.createText(Util.decodeHTML(textcontent));
			viewWriter.insert(viewWriter.createPositionAt(strView, 0), innerText);

			return strView;
		}

	}
}