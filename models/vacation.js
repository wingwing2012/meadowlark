var mongoose = require('mongoose');
var vacationSchema = mongoose.Schema({
	name : String,
	slug : String,
	category : String,
	sku : String,
	description : String,
	priceInCents : Number,
	tags : [ String ],
	inSeason : Boolean,
	available : Boolean,
	requiresWaiver : Boolean,
	maximumGuests : Number,
	notes : String,
	packagesSold : Number,
});
vacationSchema.methods.getDisplayPrice = function() {
	return '$' + (this.priceInCents / 100).toFixed(2);
};

vacationSchema
		.static(
				'addDatas',
				function() {
					new Vacation(
							{
								name : 'Hood River Day Trip',
								slug : 'hood-river-day-trip',
								category : 'Day Trip',
								sku : 'HR199',
								description : 'Spend a day sailing on the Columbia and '
										+ 'enjoying craft beers in Hood River!',
								priceInCents : 9995,
								tags : [ 'day trip', 'hood river', 'sailing',
										'windsurfing', 'breweries' ],
								inSeason : true,
								maximumGuests : 16,
								available : true,
								packagesSold : 0,
							}).save();
					new Vacation(
							{
								name : 'Oregon Coast Getaway',
								slug : 'oregon-coast-getaway',
								category : 'Weekend Getaway',
								sku : 'OC39',
								description : 'Enjoy the ocean air and quaint coastal towns!',
								priceInCents : 269995,
								tags : [ 'weekend getaway', 'oregon coast',
										'beachcombing' ],
								inSeason : false,
								maximumGuests : 8,
								available : true,
								packagesSold : 0,
							}).save();
					new Vacation(
							{
								name : 'Rock Climbing in Bend',
								slug : 'rock-climbing-in-bend',
								category : 'Adventure',
								sku : 'B99',
								description : 'Experience the thrill of climbing in the high desert.',
								priceInCents : 289995,
								tags : [ 'weekend getaway', 'bend',
										'high desert', 'rock climbing' ],
								inSeason : true,
								requiresWaiver : true,
								maximumGuests : 4,
								available : false,
								packagesSold : 0,
								notes : 'The tour guide is currently recovering from a skiing accident.',
							}).save();

				});

var Vacation = mongoose.model('Vacation', vacationSchema);
module.exports = Vacation;