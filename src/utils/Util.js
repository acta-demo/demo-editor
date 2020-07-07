import format from 'date-fns/format';
import { enUS, de } from 'date-fns/locale';

export default class Util {

	static get selectedElement() {
		return ( typeof this._selectedElement !== 'undefined' ) ? this._selectedElement : undefined;
	}

	static set selectedElement( selectedElement ) {
		this._selectedElement = selectedElement;
	}

	static encodeHTML( str ) {
		return str.replace( /&/g, '&amp;' )
			.replace( /</g, '&lt;' )
			.replace( />/g, '&gt;' )
			.replace( /"/g, '&quot;' )
			.replace( /'/g, '&apos;' );
	}

	static decodeHTML( str ) {
		return str.replace( /&apos;/g, '\'' )
			.replace( /&quot;/g, '"' )
			.replace( /&gt;/g, '>' )
			.replace( /&lt;/g, '<' )
			.replace( /&amp;/g, '&' );
	}

	static getDate( dataContent, language ) {
		let dateValue = 'UNRESOLVED';
		const patt = new RegExp( '^[0-9]{4}[.\/-]([0-9]{2}|[0-9]{1})[.\/-]([0-9]{2}|[0-9]{1})$' );
		if ( patt.test( dataContent ) ) {
			const localeObj = ( language == 'de' ) ? { locale: de } : { locale: enUS };
			const dateArr = dataContent.split( '/' );

			dateValue = format( new Date( parseInt( dateArr[ 0 ] ), parseInt( dateArr[ 1 ] ) - 1, parseInt( dateArr[ 2 ] ) ),
				'EEEE, d MMMM yyyy', localeObj );
		}
		return dateValue;
	}

	static getTime( dataContent, language ) {
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

		}
		return timeValue;
	}
}
