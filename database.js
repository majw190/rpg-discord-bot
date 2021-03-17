const mysql = require( 'mysql' );
module.exports.database = class database {
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }
    query( sql, args, value ) {
        var s = sql;
        var v = value;
        return new Promise( ( resolve, reject ) => {
            this.connection.query( s, args, ( err, rows ) => {
                if ( err )
                {
                    console.log(err)
                    return reject( err );
                }
                resolve( [rows, s, v] );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}
