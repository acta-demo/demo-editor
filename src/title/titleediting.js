import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import TitleCommand from './titlecommand';
import Util from '../utils/Util';
import './css/title.css';

export default class TitleEditing extends Plugin {

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
		console.log( 'TitleEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'title', new TitleCommand( this.editor ) );

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'title' ) )
		);

		this.listenTo( this.editor, 'change:viewmode', ( evt, propertyName, newValue, oldValue ) => {
			// Do something when the data is ready.
			TitleEditing.viewmode = newValue;
		} );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'title', {
			// Allow wherever text is allowed:
			allowWhere: '$text',

			// The variable will act as an inline node:
			isInline: true,

			// The inline widget is self-contained so it cannot be split by the caret and it can be selected:
			isObject: true,

			// The variable can have many types, like date, name, surname, etc:
			allowAttributes: [ 'data-id', 'data-content', 'data-viewmode', 'data-type', 'data-json' ]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: [ 'title' ]
			},
			model: ( viewElement, modelWriter ) => {

				const variableid = viewElement.getAttribute( 'data-id' );
				const dataType = viewElement.getAttribute( 'data-type' );
				const dataJson = viewElement.getAttribute( 'data-json' );
				const _text = viewElement.getChild( 0 );

				const modelElement = modelWriter.createElement( 'title', {
					'data-id': variableid,
					'data-content': Util.encodeHTML( _text.data ),
					'data-viewmode': TitleEditing.viewmode,
					'data-type': dataType,
					'data-json': dataJson
				} );
				console.log( '#### upcast title modelElement:', modelElement );
				return modelElement;
			}
		} );

		// Add a converter for editing downcast pipeline.
		conversion.for( 'editingDowncast' ).add( dispatcher => {
			// Specify converter for attribute `data-content` on element `content:title`.
			dispatcher.on( 'attribute:data-content:title', ( evt, data, conversionApi ) => {
				// console.log('#### editingDowncast attr evt:', evt);
				console.log( '#### editingDowncast attr data:', data );// attributeNewValue
				console.log( '#### editingDowncast attr data.attributeNewValue:', data.attributeNewValue );

				// Translate position in model to position in view.
				// const viewPosition = conversionApi.mapper.toViewPosition(data.range.start);

				// Create <p> element that will be inserted in view at `viewPosition`.
				const modelItem = data.item;
				const dataContent = ( !modelItem.getAttribute( 'data-content' )
									|| modelItem.getAttribute( 'data-content' ) == 'UNRESOLVED'
									|| modelItem.getAttribute( 'data-content' ) == '' )
					? 'UNRESOLVED'
					: modelItem.getAttribute( 'data-content' );
				console.log( '#### editingDowncast dataContent:', dataContent );
				const dataType = modelItem.getAttribute( 'data-type' );
				const variableId = modelItem.getAttribute( 'data-id' );
				const widgetElement = conversionApi.mapper.toViewElement( modelItem );
				if ( TitleEditing.viewmode === 'infoview' ) {
					widgetElement.getChild( 0 )._data = '{' + dataType + ':' + variableId + ':'
						+ Util.decodeHTML( dataContent ) + '}';
				} else {
					widgetElement.getChild( 0 )._data = Util.decodeHTML( dataContent );
				}
				console.log( '#### editingDowncast attr widgetElement:', widgetElement );

				// Bind the newly created view element to model element so positions will map accordingly in future.
				conversionApi.mapper.bindElements( modelItem, widgetElement );

				// Add the newly created view element to the view.
				// conversionApi.writer.insert(viewPosition, widgetElement);

				// Remember to stop the event propagation.
				// evt.stop();
				return widgetElement;



				// Enable widget handling on a variable element inside the editing view.
				// return toWidget(widgetElement, conversionApi.writer);
				// console.log('#### editingDowncast attr evt:', evt);
				// Skip adding and removing attribute, we are interesting only in changes in this case.
				/* if (!data.attributeOldValue || !data.attributeNewValue) {
					return;
				}*/

				// Here, use `data` and `conversionApi.mapper` and `conversionApi.writer`
				// to change the view. You will have to map the changed model element to
				// view element using `conversionApi.mapper` and replace the text
				// using `conversionApi.writer`.
			} );
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'title',
			view: ( modelItem, viewWriter ) => {
				console.log( '#### editingDowncast 1' );

				const widgetElement = createTitleEditingView( modelItem, viewWriter );

				// Enable widget handling on a variable element inside the editing view.
				return toWidget( widgetElement, viewWriter );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'title',
			view: createTitleDataView
		} );

		// Helper method for data downcast converters.
		function createTitleDataView( modelItem, viewWriter ) {

			const variableId = modelItem.getAttribute( 'data-id' );
			const dataType = modelItem.getAttribute( 'data-type' );
			const dataJson = modelItem.getAttribute( 'data-json' );
			const textcontent = modelItem.getAttribute( 'data-content' );

			const varView = viewWriter.createContainerElement( 'span', {
				class: 'title', 'data-id': variableId, 'data-type': dataType, 'data-json': dataJson, 'data-content': textcontent
			} );

			// Insert the title (as a text).
			const innerText = viewWriter.createText( Util.decodeHTML( textcontent ) );
			viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );

			console.log( '#### variable createTitleDataView varView:', varView );
			return varView;
		}

		function createTitleEditingView( modelItem, viewWriter ) {
			console.log( '#### createTitleEditingView 1' );
			const variableId = modelItem.getAttribute( 'data-id' );
			const dataType = modelItem.getAttribute( 'data-type' );
			const dataJson = modelItem.getAttribute( 'data-json' );
			const textcontent = modelItem.getAttribute( 'data-content' );
			let varView;
			if ( TitleEditing.viewmode === 'infoview' ) {
				console.log( '#### createTitleEditingView 2' );
				varView = viewWriter.createContainerElement( 'span', {
					class: 'title', 'data-id': variableId, 'data-viewmode': 'infoview', 'data-type': 'title', 'data-json': dataJson
				} );
				const innerText = viewWriter.createText( '{' + dataType + ':' + variableId + ':' + Util.decodeHTML( textcontent ) + '}' );
				viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );
			} else if ( TitleEditing.viewmode === 'coloredview' ) {
				varView = viewWriter.createContainerElement( 'span', {
					class: 'title', 'data-id': variableId, 'data-viewmode': 'coloredview', 'data-type': 'title', 'data-json': dataJson
				} );
				const innerText = viewWriter.createText( Util.decodeHTML( textcontent ) );
				viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );
			} else if ( TitleEditing.viewmode === 'simpleview' ) {
				varView = viewWriter.createContainerElement( 'span', {
					class: '', 'data-id': variableId, 'data-viewmode': 'simpleview', 'data-type': 'title', 'data-json': dataJson
				} );
				const innerText = viewWriter.createText( Util.decodeHTML( textcontent ) );
				viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );
			}
			console.log( '#### createTitleEditingView varView:', varView );
			return varView;
		}
	}
}
