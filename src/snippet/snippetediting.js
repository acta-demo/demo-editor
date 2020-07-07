import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	toWidget,
	viewToModelPositionOutsideModelElement
} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import SnippetCommand from './snippetcommand';
import './css/snippet.css';

export default class SnippetEditing extends Plugin {

	static get viewmode() {
		return ( typeof this._viewmode !== 'undefined' ) ? this._viewmode : 'infoview';
	}

	static set viewmode( viewmode ) {
		this._viewmode = viewmode;
	}

	static get requires() {
		return [ Widget ];
	}


	init() {

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'snp', new SnippetCommand( this.editor ) );

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement =>
				viewElement.hasClass( 'snippet' ) )
		);

		this.listenTo( this.editor, 'change:viewmode', ( evt, propertyName, newValue, oldValue ) => {
			// Do something when the data is ready.
			SnippetEditing.viewmode = newValue;
		} );

	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'snp', {
			allowWhere: '$text',
			allowContentOf: [ '$block', '$text', 'title', 'variable', 'str', 'lsp' ],

			// The snp will act as an inline node:
			isInline: true,

			// The inline widget is self-contained so it cannot be split by the caret and it can be selected:
			isObject: true,
			// The snp can have many types, like date, name, surname, etc:
			allowAttributes: [ 'data-id', 'data-type', 'data-viewmode', 'data-language' ]
		} );

	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: 'snippet'
			},
			model: ( viewElement, modelWriter ) => {
				console.log( '#### snp model conversion' );
				const variableid = viewElement.getAttribute( 'data-id' );
				const dataLanguage = viewElement.getAttribute( 'data-language' )
					? viewElement.getAttribute( 'data-language' )
					: 'en';

				const modelElement = modelWriter.createElement( 'snp', {
					'data-id': variableid,
					'data-viewmode': SnippetEditing.viewmode,
					'data-type': 'snp',
					'data-language': dataLanguage
				} );
				// modelWriter.appendText( '', modelElement );
				// modelWriter.appendText( ' ', modelElement );
				return modelElement;
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'snp',
			view: ( modelItem, viewWriter ) => {
				console.log( '#### createSnpEditingView CALLED!' );

				console.log( '#### elementToElement editingDowncast modelItem:', modelItem );
				const widgetElement = createSnpEditingView( modelItem, viewWriter );

				const _style = ( SnippetEditing.viewmode === 'infoview' ) ? 'display:inline' : 'display:none';
				const uiEndElement = viewWriter.createUIElement( 'span', { 'data-type': 'right-bracket', 'style': _style }, function( domDocument ) {
                	const domElement = this.toDomElement( domDocument );
                	domElement.innerHTML = '}';
               		return domElement;
				} );
				viewWriter.insert( viewWriter.createPositionAt( widgetElement, 0 ), uiEndElement );

				console.log( '#### elementToElement createSnpEditingView before insert' );
				// viewWriter.insert( viewWriter.createPositionAt( widgetElement, 0 ), uiEndElement );
				console.log( '#### elementToElement createSnpEditingView widgetElement:', widgetElement );
				// return widgetElement;
				return toWidget( widgetElement, viewWriter );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'snp',
			view: createSnpDataView
		} );

		/*
		// Keep this if we want to change model on viewmode change. We need to check also the undo functionality with toolbar update
		conversion.for('editingDowncast').add(dispatcher => dispatcher.on('attribute:data-viewmode', (evt, data, conversionApi) => {
			console.log('#### attribute:data-viewmode CALLED!');
			console.log('#### attribute:data-viewmode data:', data);
			console.log('#### attribute:data-viewmode evt:', evt);
			const myModelElement = data.item;
			console.log('#### attribute:data-viewmode myModelElement:', myModelElement);
			// Mark element as consumed by conversion.
			conversionApi.consumable.consume(data.item, evt.name);

			// Get mapped view element to update.
			const viewElement = conversionApi.mapper.toViewElement(myModelElement);
			console.log('#### attribute:data-viewmode viewElement:', viewElement);
		}));
		*/

		function createSnpEditingView( modelItem, viewWriter ) {

			const variableId = modelItem.getAttribute( 'data-id' );
			const dataLanguage = ( modelItem.getAttribute( 'data-language' ) )
				? modelItem.getAttribute( 'data-language' )
				: 'en';
			let snpView;
			if ( SnippetEditing.viewmode === 'infoview' ) {
				const _before = '{snp:' + variableId + ':';
				// const _after = '}';
				snpView = viewWriter.createContainerElement( 'div', {
					class: 'snippet', 'data-id': variableId, 'data-viewmode': 'infoview', 'data-type': 'snp',
					'data-before': _before, 'data-language': dataLanguage
				} );
			} else if ( SnippetEditing.viewmode === 'coloredview' ) {
				snpView = viewWriter.createContainerElement( 'div', {
					class: 'snippet', 'data-id': variableId, 'data-viewmode': 'coloredview', 'data-type': 'snp',
					'data-language': dataLanguage
				} );
			} else if ( SnippetEditing.viewmode === 'simpleview' ) {
				snpView = viewWriter.createContainerElement( 'div', {
					class: 'snippet snippet_simpleview', 'data-id': variableId, 'data-viewmode': 'simpleview', 'data-type': 'snp',
					'data-language': dataLanguage
				} );
			}
			console.log( '####  createSnpEditingView snpView:', snpView );
			return snpView;
		}

		function createSnpDataView( modelItem, viewWriter ) {
			console.log( '#### createSnpDataView' );
			const variableId = modelItem.getAttribute( 'data-id' );
			const dataLanguage = modelItem.getAttribute( 'data-language' )
				? modelItem.getAttribute( 'data-language' )
				: 'en';

			const snpView = viewWriter.createContainerElement( 'span', {
				class: 'snippet', 'data-id': variableId, 'data-type': 'snp', 'data-language': dataLanguage
			} );

			// Insert the snp (as a text).
			// const innerText = viewWriter.createText(Util.decodeHTML(textcontent));
			// viewWriter.insert(viewWriter.createPositionAt(snpView, 0), innerText);

			return snpView;
		}

	}
}
