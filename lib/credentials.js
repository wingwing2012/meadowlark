module.exports = {
	cookieSecret : 'your cookie secret goes here',
	gmail : {
		user : 'liyaqiang82@gmail.com',
		password : ''
	},
	mongo : {
		development : {
			connectionString : 'mongodb://localhost:27017/meadowlark_dev'
		},
		production : {
			connectionString : 'mongodb://localhost:27017/meadowlark'
		}
	}
};