export default class Util {
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
}
