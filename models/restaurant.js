const mongoose = require('mongoose');
const databaseURL = "mongodb://localhost:27017/ReviewWebsite"
const options = {useNewUrlParser: true};

mongoose.connect(databaseURL, options);

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    foundHelpful: [{
    	type: mongoose.Schema.Types.ObjectId,
    	ref: 'User'
    }],
    media: [String]
}, { timestamps: true });

const restaurantSchema = new mongoose.Schema({
	name: {
		type: String, 
		required: true
	},
	images: {
		type: [String],
		required: true
	},
	location: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Users"
	},
	reviews: [reviewSchema],
	rating: {
		type: Number,
		required: true
	}
}, {timestamps: true});

const restoModel = mongoose.model('restaurants', restaurantSchema, "restaurants");
const reviewModel = mongoose.model('reviews', reviewSchema);

exports.getTop3 = async function(){
	try{
		const result = restoModel.find({}).sort({rating: -1}).limit(3).exec();
		return result;
	}
	catch (err){
		console.error(err);
	}
};

exports.getCurrent = async function(id){
	try{
		const result = restoModel.findById(id).populate({
			path: "reviews.user",
			model: "User"
		});
		return result;
	}
	catch (err){
		console.error(err);
	}

}

exports.getUserReviews = async function(id){
	try{
		if(!mongoose.Types.ObjectId.isValid(id)){
			throw new Error('Invalid user id');
		}
		console.log(id);

		const userReviews = await restoModel.aggregate([
			{$unwind: '$reviews'},
			{$match: {'reviews.user': new mongoose.Types.ObjectId(id)}},
			{$project: {
				_id: '$_id',
				restaurantName: '$name',
				title: '$reviews.title',
				content: '$reviews.content',
				rating: '$reviews.rating',
				media: '$reviews.media'
			}}
		]);

		console.log(userReviews);
		return userReviews;
	}
	catch (err){
		console.error(err);
	}
}

exports.find = async function(searchQuery){
	try{
		const searchQueries = await restoModel.find({name: searchQuery});
		return searchQueries;
	}
	catch(err){
		console.error(err);
	}
}