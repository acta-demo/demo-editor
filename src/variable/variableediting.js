import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import VariableCommand from './variablecommand';
import Util from '../utils/Util';
import './css/variable.css';
import format from 'date-fns/format';
import { enUS, de } from 'date-fns/locale';


export default class VariableEditing extends Plugin {

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
		console.log( 'VariableEditing#init() got called' );

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'variable', new VariableCommand( this.editor ) );

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'variable' ) )
		);
		this.editor.config.define( 'variableConfig', {
			types: [ { title: 'Date', type: 'var_date' }, { title: 'Time', type: 'var_time' }, { title: 'String', type: 'var_str' } ]
		} );

		this.listenTo( this.editor, 'change:viewmode', ( evt, propertyName, newValue, oldValue ) => {
			// Do something when the data is ready.
			VariableEditing.viewmode = newValue;
		} );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'variable', {
			// Allow wherever text is allowed:
			allowWhere: [ '$text', 'snp', '$block', 'paragraph' ],

			// The variable will act as an inline node:
			isInline: true,

			// The inline widget is self-contained so it cannot be split by the caret and it can be selected:
			isObject: true,

			// The variable can have many types, like date, name, surname, etc:
			allowAttributes: [ 'data-id', 'data-content', 'data-viewmode', 'data-type', 'data-language' ]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'span',
				classes: [ 'variable' ]
			},
			model: ( viewElement, modelWriter ) => {

				const variableid = viewElement.getAttribute( 'data-id' );
				const dataType = viewElement.getAttribute( 'data-type' );
				const dataLanguage = viewElement.getAttribute( 'data-language' )
					? viewElement.getAttribute( 'data-language' )
					: 'en';
				const _text = viewElement.getChild( 0 );

				const modelElement = modelWriter.createElement( 'variable', {
					'data-id': variableid,
					'data-content': Util.encodeHTML( _text.data ),
					'data-viewmode': VariableEditing.viewmode,
					'data-type': dataType,
					'data-language': dataLanguage
				} );
				console.log( '#### upcast variable modelElement:', modelElement );
				return modelElement;
			}
		} );

		// Add a converter for editing downcast pipeline.
		conversion.for( 'editingDowncast' ).add( dispatcher => {
			dispatcher.on( 'attribute:data-content:variable', ( evt, data, conversionApi ) => {
				// console.log('#### editingDowncast attr evt:', evt);
				console.log( '#### editingDowncast attr data:', data );// attributeNewValue
				console.log( '#### editingDowncast attr data.attributeNewValue:', data.attributeNewValue );

				// Translate position in model to position in view.
				// const viewPosition = conversionApi.mapper.toViewPosition(data.range.start);

				// Create <p> element that will be inserted in view at `viewPosition`.
				const modelItem = data.item;
				let dataContent = 'UNRESOLVED';
				const dataLanguage = modelItem.getAttribute( 'data-language' )
					? modelItem.getAttribute( 'data-language' )
					: 'en';
				if ( modelItem.getAttribute( 'data-type' ) === 'var_date' ) {
					dataContent = modelItem.getAttribute( 'data-content' ) === 'UNRESOLVED'
						? 'UNRESOLVED'
						: getDate( modelItem.getAttribute( 'data-content' ), dataLanguage );
				} else if ( modelItem.getAttribute( 'data-type' ) === 'var_time' ) {
					dataContent = modelItem.getAttribute( 'data-content' ) === 'UNRESOLVED'
						? 'UNRESOLVED'
						: getTime( modelItem.getAttribute( 'data-content' ), dataLanguage );
				} else {
					dataContent = modelItem.getAttribute( 'data-content' );
				}

				console.log( '#### editingDowncast dataContent:', dataContent );
				const dataType = modelItem.getAttribute( 'data-type' );
				const variableId = modelItem.getAttribute( 'data-id' );
				const widgetElement = conversionApi.mapper.toViewElement( modelItem );
				if ( VariableEditing.viewmode === 'infoview' ) {
					widgetElement.getChild( 0 )._data = '{' + dataType + ':' + variableId + ':'
						+ ( ( dataType === 'var_time' && Util.decodeHTML( dataContent ) !== 'UNRESOLVED' )
							? ( '"' + Util.decodeHTML( dataContent ) + '"' )
							: Util.decodeHTML( dataContent ) )
						+ '}';
				} else if ( VariableEditing.viewmode === 'coloredview' ) {
					widgetElement.getChild( 0 )._data = Util.decodeHTML( dataContent );
				} else if ( VariableEditing.viewmode === 'simpleview' ) {
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
			model: 'variable',
			view: ( modelItem, viewWriter ) => {
				console.log( '#### editingDowncast 1' );
				const dataType = modelItem.getAttribute( 'data-type' );
				let widgetElement;
				if ( dataType === 'var_date' ) {
					widgetElement = createVariableDateEditingView( modelItem, viewWriter );
				} else if ( dataType === 'var_time' ) {
					widgetElement = createVariableTimeEditingView( modelItem, viewWriter );
				} else if ( dataType === 'var_str' ) {
					widgetElement = createVariableStrEditingView( modelItem, viewWriter );
				}

				// Enable widget handling on a variable element inside the editing view.
				return toWidget( widgetElement, viewWriter );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'variable',
			view: createVariableDataView
		} );

		// Helper method for data downcast converters.
		function createVariableDataView( modelItem, viewWriter ) {

			const variableId = modelItem.getAttribute( 'data-id' );
			const dataType = modelItem.getAttribute( 'data-type' );
			const textcontent = modelItem.getAttribute( 'data-content' );
			const dataLanguage = modelItem.getAttribute( 'data-language' )
				? modelItem.getAttribute( 'data-language' )
				: 'en';

			const varView = viewWriter.createContainerElement( 'span', {
				class: 'variable', 'data-id': variableId, 'data-type': dataType, 'data-content': textcontent, 'data-language': dataLanguage
			} );

			// Insert the variable (as a text).
			const innerText = viewWriter.createText( Util.decodeHTML( textcontent ) );
			viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );

			console.log( '#### variable createVariableDataView varView:', varView );
			return varView;
		}

		function getDate( dataContent, language ) {
			let dateValue = 'UNRESOLVED';
			const patt = new RegExp( '^[0-9]{4}[.\/-]([0-9]{2}|[0-9]{1})[.\/-]([0-9]{2}|[0-9]{1})$' );
			if ( patt.test( dataContent ) ) {
				const localeObj = ( language == 'de' ) ? { locale: de } : { locale: enUS };
				const dateArr = dataContent.split( '/' );
				console.log( '#### getDate dateArr:', dateArr );
				dateValue = format( new Date( parseInt( dateArr[ 0 ] ), parseInt( dateArr[ 1 ] ) - 1, parseInt( dateArr[ 2 ] ) ),
					'EEEE, d MMMM yyyy', localeObj );
				console.log( '#### createVariableDateEditingView dateValue:', dateValue );
			}
			return dateValue;
		}

		function getTime( dataContent, language ) {
			let timeValue = 'UNRESOLVED';
			const patt = new RegExp( '^([0-9]{2}|[0-9]{1})[.\:-]([0-9]{2}|[0-9]{1})$' );
			if ( patt.test( dataContent ) ) {
				const timeArr = dataContent.split( ':' );
				const hours = timeArr[ 0 ].length === 1
					? '0' + timeArr[ 0 ]
					: timeArr[ 0 ];
				const minutes = timeArr[ 1 ].length === 1
					? '0' + timeArr[ 1 ]
					: timeArr[ 1 ];
				timeValue = ( language == 'de' ) ? hours + ':' + minutes + ' Uhr' : hours + ':' + minutes;
				console.log( '#### getTime timeArr:', timeArr );
				console.log( '#### getTime timeValue:', timeValue );
			}
			return timeValue;
		}

		function createVariableDateEditingView( modelItem, viewWriter ) {
			console.log( '#### createVariableDateEditingView 1' );
			const variableId = modelItem.getAttribute( 'data-id' );
			const dataType = modelItem.getAttribute( 'data-type' );
			const dataLanguage = modelItem.getAttribute( 'data-language' )
				? modelItem.getAttribute( 'data-language' )
				: 'en';
			const textcontent = modelItem.getAttribute( 'data-content' );
			let varView;
			if ( VariableEditing.viewmode === 'infoview' ) {
				console.log( '#### createVariableDateEditingView 2' );
				varView = viewWriter.createContainerElement( 'span', {
					class: 'variable', 'data-id': variableId, 'data-viewmode': 'infoview', 'data-type': 'var_date', 'data-language': dataLanguage
				} );
				const innerText = viewWriter.createText( '{' + dataType + ':' + variableId + ':' + Util.decodeHTML( getDate( textcontent ) ) + '}' );
				viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );
			} else if ( VariableEditing.viewmode === 'coloredview' ) {
				varView = viewWriter.createContainerElement( 'span', {
					class: 'variable', 'data-id': variableId, 'data-viewmode': 'coloredview', 'data-type': 'var_date', 'data-language': dataLanguage
				} );
				const innerText = viewWriter.createText( Util.decodeHTML( getDate( textcontent ) ) );
				viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );
			} else if ( VariableEditing.viewmode === 'simpleview' ) {
				varView = viewWriter.createContainerElement( 'span', {
					class: '', 'data-id': variableId, 'data-viewmode': 'simpleview', 'data-type': 'var_date', 'data-language': dataLanguage
				} );
				const innerText = viewWriter.createText( Util.decodeHTML( getDate( textcontent ) ) );
				viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );
			}
			console.log( '#### createVariableDateEditingView varView:', varView );
			return varView;
		}

		function createVariableTimeEditingView( modelItem, viewWriter ) {

			const variableId = modelItem.getAttribute( 'data-id' );
			const dataType = modelItem.getAttribute( 'data-type' );
			const dataLanguage = modelItem.getAttribute( 'data-language' )
				? modelItem.getAttribute( 'data-language' )
				: 'en';
			const textcontent = modelItem.getAttribute( 'data-content' );
			let varView;
			if ( VariableEditing.viewmode === 'infoview' ) {
				varView = viewWriter.createContainerElement( 'span', {
					class: 'variable', 'data-id': variableId, 'data-viewmode': 'infoview', 'data-type': 'var_time', 'data-language': dataLanguage
				} );
				const innerText = viewWriter.createText( '{' + dataType + ':' + variableId + ':' + Util.decodeHTML( textcontent ) + '}' );
				viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );
			} else if ( VariableEditing.viewmode === 'coloredview' ) {
				varView = viewWriter.createContainerElement( 'span', {
					class: 'variable', 'data-id': variableId, 'data-viewmode': 'coloredview', 'data-type': 'var_time', 'data-language': dataLanguage
				} );
				const innerText = viewWriter.createText( Util.decodeHTML( textcontent ) );
				viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );
			} else if ( VariableEditing.viewmode === 'simpleview' ) {
				varView = viewWriter.createContainerElement( 'span', {
					class: '', 'data-id': variableId, 'data-viewmode': 'simpleview', 'data-type': 'var_time', 'data-language': dataLanguage
				} );
				const innerText = viewWriter.createText( Util.decodeHTML( textcontent ) );
				viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );
			}

			return varView;
		}

		function createVariableStrEditingView( modelItem, viewWriter ) {

			const variableId = modelItem.getAttribute( 'data-id' );
			const dataType = modelItem.getAttribute( 'data-type' );
			const dataLanguage = modelItem.getAttribute( 'data-language' )
				? modelItem.getAttribute( 'data-language' )
				: 'en';
			const textcontent = modelItem.getAttribute( 'data-content' );
			let varView;
			if ( VariableEditing.viewmode === 'infoview' ) {
				varView = viewWriter.createContainerElement( 'span', {
					class: 'variable', 'data-id': variableId, 'data-viewmode': 'infoview', 'data-type': 'var_str', 'data-language': dataLanguage
				} );
				const innerText = viewWriter.createText( '{' + dataType + ':' + variableId + ':' + Util.decodeHTML( textcontent ) + '}' );
				viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );
			} else if ( VariableEditing.viewmode === 'coloredview' ) {
				varView = viewWriter.createContainerElement( 'span', {
					class: 'variable', 'data-id': variableId, 'data-viewmode': 'coloredview', 'data-type': 'var_str', 'data-language': dataLanguage
				} );
				const innerText = viewWriter.createText( Util.decodeHTML( textcontent ) );
				viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );
			} else if ( VariableEditing.viewmode === 'simpleview' ) {
				varView = viewWriter.createContainerElement( 'span', {
					class: '', 'data-id': variableId, 'data-viewmode': 'simpleview', 'data-type': 'var_str', 'data-language': dataLanguage
				} );
				const innerText = viewWriter.createText( Util.decodeHTML( textcontent ) );
				viewWriter.insert( viewWriter.createPositionAt( varView, 0 ), innerText );
			}

			return varView;
		}
	}
}
